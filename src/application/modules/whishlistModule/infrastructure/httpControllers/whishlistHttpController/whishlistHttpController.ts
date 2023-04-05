import {
  createWhishlistEntryResponseCreatedBodySchema,
  CreateWhishlistEntryBody,
  CreateWhishlistEntryResponseCreatedBody,
  createWhishlistEntryBodySchema,
} from './schemas/createWhishlistEntrySchema';
import {
  DeleteWhishlistEntryPathParameters,
  DeleteWhishlistEntryResponseNoContentBody,
  deleteWhishlistEntryPathParametersSchema,
  deleteWhishlistEntryResponseNoContentBodySchema,
} from './schemas/deleteWhishlistEntrySchema';
import {
  FindWhishlistEntriesQueryParameters,
  FindWhishlistEntriesResponseOkBody,
  findWhishlistEntriesQueryParametersSchema,
  findWhishlistEntriesResponseOkBodySchema,
} from './schemas/findWhishlistEntriesSchema';
import { AuthorizationType } from '../../../../../../common/http/authorizationType';
import { HttpController } from '../../../../../../common/http/httpController';
import { HttpMethodName } from '../../../../../../common/http/httpMethodName';
import { HttpRequest } from '../../../../../../common/http/httpRequest';
import {
  HttpCreatedResponse,
  HttpForbiddenResponse,
  HttpNoContentResponse,
  HttpNotFoundResponse,
  HttpOkResponse,
  HttpUnprocessableEntityResponse,
} from '../../../../../../common/http/httpResponse';
import { HttpRoute } from '../../../../../../common/http/httpRoute';
import { HttpStatusCode } from '../../../../../../common/http/httpStatusCode';
import { ResponseErrorBody, responseErrorBodySchema } from '../../../../../../common/http/responseErrorBodySchema';
import { PaginationDataBuilder } from '../../../../../../common/paginationDataBuilder/paginationDataBuilder';
import { UserRole } from '../../../../../../common/types/userRole';
import { Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { UnitOfWorkFactory } from '../../../../../../libs/unitOfWork/factories/unitOfWorkFactory/unitOfWorkFactory';
import { unitOfWorkModuleSymbols } from '../../../../../../libs/unitOfWork/unitOfWorkModuleSymbols';
import { CustomerService } from '../../../../customerModule/application/services/customerService/customerService';
import { customerModuleSymbols } from '../../../../customerModule/customerModuleSymbols';
import { Customer } from '../../../../customerModule/domain/entities/customer/customer';
import { WhishlistService } from '../../../application/services/whishlistService/whishlistService';
import { WhishlistEntry } from '../../../domain/entities/whishlistEntry/whishlistEntry';
import { whishlistModuleSymbols } from '../../../whishlistModuleSymbols';
import { CustomerFromAccessTokenNotMatchingCustomerFromWhishlistEntryError } from '../../errors/customerFromAccessTokenNotMatchingCustomerFromWhishlistEntryError';
import { UserIsNotCustomerError } from '../../errors/userIsNotCustomerError';
import { WhishlistEntryAlreadyExistsError } from '../../errors/whishlistEntryAlreadyExistsError';
import { WhishlistEntryNotFoundError } from '../../errors/whishlistEntryNotFoundError';

export class WhishlistHttpController implements HttpController {
  public readonly basePath = 'whishlist-entries';

  public constructor(
    @Inject(unitOfWorkModuleSymbols.unitOfWorkFactory)
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    @Inject(whishlistModuleSymbols.whishlistService)
    private readonly whishlistService: WhishlistService,
    @Inject(customerModuleSymbols.customerService)
    private readonly customerService: CustomerService,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        method: HttpMethodName.post,
        handler: this.createWhishlistEntry.bind(this),
        schema: {
          request: {
            body: createWhishlistEntryBodySchema,
          },
          response: {
            [HttpStatusCode.created]: {
              schema: createWhishlistEntryResponseCreatedBodySchema,
            },
            [HttpStatusCode.unprocessableEntity]: {
              schema: responseErrorBodySchema,
            },
            [HttpStatusCode.forbidden]: {
              schema: responseErrorBodySchema,
            },
          },
        },
        authorizationType: AuthorizationType.bearerToken,
      }),
      new HttpRoute({
        method: HttpMethodName.get,
        handler: this.findWhishlistEntries.bind(this),
        schema: {
          request: {
            queryParams: findWhishlistEntriesQueryParametersSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findWhishlistEntriesResponseOkBodySchema,
            },
            [HttpStatusCode.forbidden]: {
              schema: responseErrorBodySchema,
            },
          },
        },
        authorizationType: AuthorizationType.bearerToken,
      }),
      new HttpRoute({
        method: HttpMethodName.delete,
        path: ':id',
        handler: this.deleteWhishlistEntry.bind(this),
        schema: {
          request: {
            pathParams: deleteWhishlistEntryPathParametersSchema,
          },
          response: {
            [HttpStatusCode.noContent]: {
              schema: deleteWhishlistEntryResponseNoContentBodySchema,
            },
            [HttpStatusCode.forbidden]: {
              schema: responseErrorBodySchema,
            },
            [HttpStatusCode.notFound]: {
              schema: responseErrorBodySchema,
            },
          },
        },
        authorizationType: AuthorizationType.bearerToken,
      }),
    ];
  }

  private async createWhishlistEntry(
    request: HttpRequest<CreateWhishlistEntryBody>,
  ): Promise<
    | HttpCreatedResponse<CreateWhishlistEntryResponseCreatedBody>
    | HttpForbiddenResponse<ResponseErrorBody>
    | HttpUnprocessableEntityResponse<ResponseErrorBody>
  > {
    const { bookId } = request.body;

    const unitOfWork = await this.unitOfWorkFactory.create();

    let whishlistEntry: WhishlistEntry | undefined;

    try {
      whishlistEntry = await unitOfWork.runInTransaction(async () => {
        const { userId } = request.context;

        let customer: Customer;

        try {
          customer = await this.customerService.findCustomer({ unitOfWork, userId });
        } catch (error) {
          throw new UserIsNotCustomerError({ userId: userId as string });
        }

        return this.whishlistService.createWhishlistEntry({ unitOfWork, draft: { bookId, customerId: customer.id } });
      });
    } catch (error) {
      if (error instanceof UserIsNotCustomerError) {
        return { statusCode: HttpStatusCode.forbidden, body: { error } };
      }

      if (error instanceof WhishlistEntryAlreadyExistsError) {
        return { statusCode: HttpStatusCode.unprocessableEntity, body: { error } };
      }

      throw error;
    }

    return { statusCode: HttpStatusCode.created, body: { whishlistEntry } };
  }

  private async findWhishlistEntries(
    request: HttpRequest<undefined, FindWhishlistEntriesQueryParameters>,
  ): Promise<HttpOkResponse<FindWhishlistEntriesResponseOkBody> | HttpForbiddenResponse<ResponseErrorBody>> {
    const { limit, page } = request.queryParams;

    const { userId } = request.context;

    const pagination = PaginationDataBuilder.build({ page: page ?? 0, limit: limit ?? 0 });

    const unitOfWork = await this.unitOfWorkFactory.create();

    let whishlistEntries: WhishlistEntry[] = [];

    try {
      whishlistEntries = await unitOfWork.runInTransaction(async () => {
        let customer: Customer;

        try {
          customer = await this.customerService.findCustomer({ unitOfWork, userId });
        } catch (error) {
          throw new UserIsNotCustomerError({ userId: userId as string });
        }

        return this.whishlistService.findWhishlistEntries({ unitOfWork, pagination, customerId: customer.id });
      });
    } catch (error) {
      if (error instanceof UserIsNotCustomerError) {
        return { statusCode: HttpStatusCode.forbidden, body: { error } };
      }

      throw error;
    }

    return { statusCode: HttpStatusCode.ok, body: { data: whishlistEntries } };
  }

  private async deleteWhishlistEntry(
    request: HttpRequest<undefined, undefined, DeleteWhishlistEntryPathParameters>,
  ): Promise<
    | HttpNoContentResponse<DeleteWhishlistEntryResponseNoContentBody>
    | HttpForbiddenResponse<ResponseErrorBody>
    | HttpNotFoundResponse<ResponseErrorBody>
  > {
    const { id } = request.pathParams;

    const { userId, role } = request.context;

    const unitOfWork = await this.unitOfWorkFactory.create();

    try {
      await unitOfWork.runInTransaction(async () => {
        let customer: Customer;

        try {
          customer = await this.customerService.findCustomer({ unitOfWork, userId });
        } catch (error) {
          throw new UserIsNotCustomerError({ userId: userId as string });
        }

        const existingWhishlistEntry = await this.whishlistService.findWhishlistEntry({
          unitOfWork,
          whishlistEntryId: id,
        });

        if (existingWhishlistEntry.customerId !== customer.id && role === UserRole.user) {
          throw new CustomerFromAccessTokenNotMatchingCustomerFromWhishlistEntryError({
            customerId: customer.id,
            whistlistEntryCustomerId: existingWhishlistEntry.customerId,
          });
        }

        await this.whishlistService.deleteWhishlistEntry({ unitOfWork, whishlistEntryId: id });
      });
    } catch (error) {
      if (
        error instanceof CustomerFromAccessTokenNotMatchingCustomerFromWhishlistEntryError ||
        error instanceof UserIsNotCustomerError
      ) {
        return { statusCode: HttpStatusCode.forbidden, body: { error } };
      }

      if (error instanceof WhishlistEntryNotFoundError) {
        return { statusCode: HttpStatusCode.notFound, body: { error } };
      }

      throw error;
    }

    return { statusCode: HttpStatusCode.noContent, body: null };
  }
}
