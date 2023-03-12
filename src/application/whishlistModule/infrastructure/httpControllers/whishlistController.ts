import { Router, NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { CreateWhishlistEntryPayload, createWhishlistEntryPayloadSchema } from './payloads/createWhishlistEntryPayload';
import { DeleteWhishlistEntryPayload, deleteWhishlistEntryPayloadSchema } from './payloads/deleteWhishlistEntryPayload';
import { FindWhishlistEntriesPayload, findWhishlistEntriesPayloadSchema } from './payloads/findWhishlistEntriesPayload';
import { whishlistErrorMiddleware } from './whishlistErrorMiddleware';
import { HttpStatusCode } from '../../../../common/http/httpStatusCode';
import { AuthMiddleware } from '../../../../common/middlewares/authMiddleware';
import { sendResponseMiddleware } from '../../../../common/middlewares/sendResponseMiddleware';
import { PaginationDataBuilder } from '../../../../common/paginationDataBuilder/paginationDataBuilder';
import { AccessTokenData } from '../../../../common/types/accessTokenData';
import { ControllerResponse } from '../../../../common/types/controllerResponse';
import { LocalsName } from '../../../../common/types/localsName';
import { QueryParameterName } from '../../../../common/types/queryParameterName';
import { Injectable, Inject } from '../../../../libs/dependencyInjection/decorators';
import { UnitOfWorkFactory } from '../../../../libs/unitOfWork/factories/unitOfWorkFactory/unitOfWorkFactory';
import { unitOfWorkModuleSymbols } from '../../../../libs/unitOfWork/unitOfWorkModuleSymbols';
import { Validator } from '../../../../libs/validator/validator';
import { customerModuleSymbols } from '../../../customerModule/customerModuleSymbols';
import { Customer } from '../../../customerModule/domain/entities/customer/customer';
import { CustomerService } from '../../../tests/services/customerService';
import { WhishlistService } from '../../application/services/whishlistService/whishlistService';
import { WhishlistEntry } from '../../domain/entities/whishlistEntry/whishlistEntry';
import { whishlistModuleSymbols } from '../../whishlistModuleSymbols';
import { CustomerFromAccessTokenNotMatchingCustomerFromWhishlistEntryError } from '../errors/customerFromAccessTokenNotMatchingCustomerFromWhishlistEntryError';
import { UserIsNotCustomerError } from '../errors/userIsNotCustomerError';

@Injectable()
export class WhishlistController {
  public readonly router = Router();
  private readonly whishlistEntriesEndpoint = '/whishlist-entries';
  private readonly whishlistEntryEndpoint = `${this.whishlistEntriesEndpoint}/:id`;

  public constructor(
    @Inject(unitOfWorkModuleSymbols.unitOfWorkFactory)
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    @Inject(whishlistModuleSymbols.whishlistService)
    private readonly whishlistService: WhishlistService,
    @Inject(customerModuleSymbols.customerService)
    private readonly customerService: CustomerService,
    @Inject(integrationsSymbols.authMiddleware)
    authMiddleware: AuthMiddleware,
  ) {
    const verifyAccessToken = authMiddleware.verifyToken.bind(authMiddleware);

    this.router.post(
      this.whishlistEntriesEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { bookId } = request.body;

        const accessTokenData: AccessTokenData = response.locals[LocalsName.accessTokenData];

        const whishlistEntry = await this.createWhishlistEntry({ bookId, accessTokenData });

        const controllerResponse: ControllerResponse = { data: { whishlistEntry }, statusCode: HttpStatusCode.created };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.get(
      this.whishlistEntriesEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const page = Number(request.query[QueryParameterName.page] ?? 0);

        const limit = Number(request.query[QueryParameterName.limit] ?? 0);

        const pagination = PaginationDataBuilder.build({ page, limit });

        const customerId = request.query[QueryParameterName.customerId] as string;

        const whishlistEntries = await this.findWhishlistEntries({ pagination, customerId });

        const controllerResponse: ControllerResponse = {
          data: { whishlistEntries },
          statusCode: HttpStatusCode.ok,
        };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.delete(
      this.whishlistEntryEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { id } = request.params;

        const accessTokenData: AccessTokenData = response.locals[LocalsName.accessTokenData];

        await this.deleteWhishlistEntry({ id: id as string, accessTokenData });

        const controllerResponse: ControllerResponse = { statusCode: HttpStatusCode.noContent };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.use(sendResponseMiddleware);

    this.router.use(whishlistErrorMiddleware);
  }

  private async createWhishlistEntry(input: CreateWhishlistEntryPayload): Promise<WhishlistEntry> {
    const { bookId, accessTokenData } = Validator.validate(createWhishlistEntryPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    const whishlistEntry = await unitOfWork.runInTransaction(async () => {
      const { userId } = accessTokenData;

      let customer: Customer;

      try {
        customer = await this.customerService.findCustomer({ unitOfWork, userId });
      } catch (error) {
        throw new UserIsNotCustomerError({ userId });
      }
      return this.whishlistService.createWhishlistEntry({ unitOfWork, draft: { bookId, customerId: customer.id } });
    });

    return whishlistEntry;
  }

  private async findWhishlistEntries(input: FindWhishlistEntriesPayload): Promise<WhishlistEntry[]> {
    const { pagination, customerId } = Validator.validate(findWhishlistEntriesPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    const whishlistEntrys = await unitOfWork.runInTransaction(async () => {
      return this.whishlistService.findWhishlistEntries({ unitOfWork, customerId, pagination });
    });

    return whishlistEntrys;
  }

  private async deleteWhishlistEntry(input: DeleteWhishlistEntryPayload): Promise<void> {
    const { id, accessTokenData } = Validator.validate(deleteWhishlistEntryPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    await unitOfWork.runInTransaction(async () => {
      const { userId } = accessTokenData;

      let customer: Customer;

      try {
        customer = await this.customerService.findCustomer({ unitOfWork, userId });
      } catch (error) {
        throw new UserIsNotCustomerError({ userId });
      }

      const existingWhishlistEntry = await this.whishlistService.findWhishlistEntry({
        unitOfWork,
        whishlistEntryId: id,
      });

      if (existingWhishlistEntry.customerId !== customer.id) {
        throw new CustomerFromAccessTokenNotMatchingCustomerFromWhishlistEntryError({
          customerId: customer.id,
          whistlistEntryCustomerId: existingWhishlistEntry.customerId,
        });
      }

      await this.whishlistService.deleteWhishlistEntry({ unitOfWork, whishlistEntryId: id });
    });
  }
}
