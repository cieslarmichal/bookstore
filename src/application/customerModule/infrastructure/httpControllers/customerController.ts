import { Router, NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { customerErrorMiddleware } from './customerErrorMiddleware';
import { CreateCustomerPayload, createCustomerPayloadSchema } from './payloads/createCustomerPayload';
import { DeleteCustomerPayload, deleteCustomerPayloadSchema } from './payloads/deleteCustomerPayload';
import { FindCustomerPayload, findCustomerPayloadSchema } from './payloads/findCustomerPayload';
import { HttpStatusCode } from '../../../../common/http/contracts/httpStatusCode';
import { ControllerResponse } from '../../../../common/types/contracts/controllerResponse';
import { LocalsName } from '../../../../common/types/contracts/localsName';
import { Injectable, Inject } from '../../../../libs/dependencyInjection/decorators';
import { UnitOfWorkFactory } from '../../../../libs/unitOfWork/contracts/factories/unitOfWorkFactory/unitOfWorkFactory';
import { unitOfWorkModuleSymbols } from '../../../../libs/unitOfWork/unitOfWorkModuleSymbols';
import { Validator } from '../../../../libs/validator/implementations/validator';
import { AuthMiddleware } from '../../../integrations/common/middlewares/authMiddleware';
import { sendResponseMiddleware } from '../../../integrations/common/middlewares/sendResponseMiddleware';
import { CustomerService } from '../../../tests/services/customerService';
import { customerModuleSymbols } from '../../customerModuleSymbols';

@Injectable()
export class CustomerController {
  public readonly router = Router();
  private readonly customersEndpoint = '/customers';
  private readonly customerEndpoint = `${this.customersEndpoint}/:id`;

  public constructor(
    @Inject(unitOfWorkModuleSymbols.unitOfWorkFactory)
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    @Inject(customerModuleSymbols.customerService)
    private readonly customerService: CustomerService,
    @Inject(integrationsSymbols.authMiddleware)
    authMiddleware: AuthMiddleware,
  ) {
    const verifyAccessToken = authMiddleware.verifyToken.bind(authMiddleware);

    this.router.post(
      this.customersEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { userId } = request.body;

        const customer = await this.createCustomer({ userId });

        const controllerResponse: ControllerResponse = { data: { customer }, statusCode: HttpStatusCode.created };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.get(
      this.customerEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { id } = request.params;

        const customer = await this.findCustomer({ id: id as string });

        const controllerResponse: ControllerResponse = { data: { customer }, statusCode: HttpStatusCode.ok };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.delete(
      this.customerEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { id } = request.params;

        await this.deleteCustomer({ id: id as string });

        const controllerResponse: ControllerResponse = { statusCode: HttpStatusCode.noContent };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.use(sendResponseMiddleware);

    this.router.use(customerErrorMiddleware);
  }

  private async createCustomer(input: CreateCustomerPayload): Promise<ControllerResponse> {
    const { userId } = Validator.validate(createCustomerPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    const customer = await unitOfWork.runInTransaction(async () => {
      return this.customerService.createCustomer({ unitOfWork, draft: { userId } });
    });

    return { data: { customer }, statusCode: HttpStatusCode.created };
  }

  private async findCustomer(input: FindCustomerPayload): Promise<ControllerResponse> {
    const { id } = Validator.validate(findCustomerPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    const customer = await unitOfWork.runInTransaction(async () => {
      return this.customerService.findCustomer({ unitOfWork, customerId: id });
    });

    return { data: { customer }, statusCode: HttpStatusCode.ok };
  }

  private async deleteCustomer(input: DeleteCustomerPayload): Promise<ControllerResponse> {
    const { id } = Validator.validate(deleteCustomerPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    await unitOfWork.runInTransaction(async () => {
      await this.customerService.deleteCustomer({ unitOfWork, customerId: id });
    });

    return { statusCode: HttpStatusCode.noContent };
  }
}
