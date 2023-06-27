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
import { Inject, Injectable } from '../../../../../../libs/dependencyInjection/decorators';
import { UnitOfWorkFactory } from '../../../../../../libs/unitOfWork/factories/unitOfWorkFactory/unitOfWorkFactory';
import { unitOfWorkModuleSymbols } from '../../../../../../libs/unitOfWork/unitOfWorkModuleSymbols';
import { FindCustomerQueryHandler } from '../../../../customerModule/application/queryHandlers/findCustomerQueryHandler/findCustomerQueryHandler';
import { Customer } from '../../../../customerModule/domain/entities/customer/customer';
import { customerSymbols } from '../../../../customerModule/symbols';
import { CreateWhishlistEntryCommandHandler } from '../../../application/commandHandlers/createWhishlistEntryCommandHandler/createWhishlistEntryCommandHandler';
import { DeleteWhishlistEntryCommandHandler } from '../../../application/commandHandlers/deleteWhishlistEntryCommandHandler/deleteWhishlistEntryCommandHandler';
import { CustomerFromAccessTokenNotMatchingCustomerFromWhishlistEntryError } from '../../../application/errors/customerFromAccessTokenNotMatchingCustomerFromWhishlistEntryError';
import { UserIsNotCustomerError } from '../../../application/errors/userIsNotCustomerError';
import { WhishlistEntryAlreadyExistsError } from '../../../application/errors/whishlistEntryAlreadyExistsError';
import { WhishlistEntryNotFoundError } from '../../../application/errors/whishlistEntryNotFoundError';
import { FindWhishlistEntriesQueryHandler } from '../../../application/queryHandlers/findWhishlistEntriesQueryHandler/findWhishlistEntriesQueryHandler';
import { FindWhishlistEntryQueryHandler } from '../../../application/queryHandlers/findWhishlistEntryQueryHandler/findWhishlistEntryQueryHandler';
import { symbols } from '../../../symbols';

@Injectable()
export class WhishlistHttpController implements HttpController {
  public readonly basePath = 'whishlist-entries';

  public constructor(
    @Inject(unitOfWorkModuleSymbols.unitOfWorkFactory)
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    @Inject(symbols.createWhishlistEntryCommandHandler)
    private readonly createWhishlistEntryCommandHandler: CreateWhishlistEntryCommandHandler,
    @Inject(symbols.deleteWhishlistEntryCommandHandler)
    private readonly deleteWhishlistEntryCommandHandler: DeleteWhishlistEntryCommandHandler,
    @Inject(symbols.findWhishlistEntryQueryHandler)
    private readonly findWhishlistEntryQueryHandler: FindWhishlistEntryQueryHandler,
    @Inject(symbols.findWhishlistEntriesQueryHandler)
    private readonly findWhishlistEntriesQueryHandler: FindWhishlistEntriesQueryHandler,
    @Inject(customerSymbols.findCustomerQueryHandler)
    private readonly findCustomerQueryHandler: FindCustomerQueryHandler,
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

    try {
      const { whishlistEntry } = await unitOfWork.runInTransaction(async () => {
        const { userId } = request.context;

        let customer: Customer;

        try {
          const result = await this.findCustomerQueryHandler.execute({ unitOfWork, userId });

          customer = result.customer;
        } catch (error) {
          throw new UserIsNotCustomerError({ userId: userId as string });
        }

        return this.createWhishlistEntryCommandHandler.execute({
          unitOfWork,
          draft: { bookId, customerId: customer.id },
        });
      });

      return { statusCode: HttpStatusCode.created, body: { whishlistEntry } };
    } catch (error) {
      if (error instanceof UserIsNotCustomerError) {
        return { statusCode: HttpStatusCode.forbidden, body: { error } };
      }

      if (error instanceof WhishlistEntryAlreadyExistsError) {
        return { statusCode: HttpStatusCode.unprocessableEntity, body: { error } };
      }

      throw error;
    }
  }

  private async findWhishlistEntries(
    request: HttpRequest<undefined, FindWhishlistEntriesQueryParameters>,
  ): Promise<HttpOkResponse<FindWhishlistEntriesResponseOkBody> | HttpForbiddenResponse<ResponseErrorBody>> {
    const { limit, page } = request.queryParams;

    const { userId } = request.context;

    const pagination = PaginationDataBuilder.build({ page: Number(page) ?? 0, limit: Number(limit) ?? 0 });

    const unitOfWork = await this.unitOfWorkFactory.create();

    try {
      const { whishlistEntries } = await unitOfWork.runInTransaction(async () => {
        let customer: Customer;

        try {
          const result = await this.findCustomerQueryHandler.execute({ unitOfWork, userId });

          customer = result.customer;
        } catch (error) {
          throw new UserIsNotCustomerError({ userId: userId as string });
        }

        return this.findWhishlistEntriesQueryHandler.execute({ unitOfWork, pagination, customerId: customer.id });
      });

      return { statusCode: HttpStatusCode.ok, body: { data: whishlistEntries } };
    } catch (error) {
      if (error instanceof UserIsNotCustomerError) {
        return { statusCode: HttpStatusCode.forbidden, body: { error } };
      }

      throw error;
    }
  }

  private async deleteWhishlistEntry(
    request: HttpRequest<undefined, undefined, DeleteWhishlistEntryPathParameters>,
  ): Promise<
    | HttpNoContentResponse<DeleteWhishlistEntryResponseNoContentBody>
    | HttpForbiddenResponse<ResponseErrorBody>
    | HttpNotFoundResponse<ResponseErrorBody>
  > {
    const { id } = request.pathParams;

    const { userId } = request.context;

    const unitOfWork = await this.unitOfWorkFactory.create();

    try {
      await unitOfWork.runInTransaction(async () => {
        let customer: Customer;

        try {
          const result = await this.findCustomerQueryHandler.execute({ unitOfWork, userId });

          customer = result.customer;
        } catch (error) {
          throw new UserIsNotCustomerError({ userId: userId as string });
        }

        const { whishlistEntry: existingWhishlistEntry } = await this.findWhishlistEntryQueryHandler.execute({
          unitOfWork,
          whishlistEntryId: id,
        });

        if (existingWhishlistEntry.customerId !== customer.id) {
          throw new CustomerFromAccessTokenNotMatchingCustomerFromWhishlistEntryError({
            customerId: customer.id,
            whistlistEntryCustomerId: existingWhishlistEntry.customerId,
          });
        }

        await this.deleteWhishlistEntryCommandHandler.execute({ unitOfWork, whishlistEntryId: id });
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
