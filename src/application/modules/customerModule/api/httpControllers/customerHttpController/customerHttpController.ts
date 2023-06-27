import {
  createCustomerBodySchema,
  createCustomerResponseCreatedBodySchema,
  CreateCustomerBody,
  CreateCustomerResponseCreatedBody,
} from './schemas/createCustomerSchema';
import {
  deleteCustomerPathParametersSchema,
  deleteCustomerResponseNoContentBodySchema,
  DeleteCustomerPathParameters,
  DeleteCustomerResponseNoContentBody,
} from './schemas/deleteCustomerSchema';
import {
  FindCustomerPathParameters,
  FindCustomerResponseOkBody,
  findCustomerPathParametersSchema,
  findCustomerResponseOkBodySchema,
} from './schemas/findCustomerSchema';
import { AuthorizationType } from '../../../../../../common/http/authorizationType';
import { HttpController } from '../../../../../../common/http/httpController';
import { HttpMethodName } from '../../../../../../common/http/httpMethodName';
import { HttpRequest } from '../../../../../../common/http/httpRequest';
import {
  HttpCreatedResponse,
  HttpNoContentResponse,
  HttpNotFoundResponse,
  HttpOkResponse,
  HttpUnprocessableEntityResponse,
} from '../../../../../../common/http/httpResponse';
import { HttpRoute } from '../../../../../../common/http/httpRoute';
import { HttpStatusCode } from '../../../../../../common/http/httpStatusCode';
import { ResponseErrorBody, responseErrorBodySchema } from '../../../../../../common/http/responseErrorBodySchema';
import { Inject, Injectable } from '../../../../../../libs/dependencyInjection/decorators';
import { UnitOfWorkFactory } from '../../../../../../libs/unitOfWork/factories/unitOfWorkFactory/unitOfWorkFactory';
import { unitOfWorkModuleSymbols } from '../../../../../../libs/unitOfWork/unitOfWorkModuleSymbols';
import { CreateCustomerCommandHandler } from '../../../application/commandHandlers/createCustomerCommandHandler/createCustomerCommandHandler';
import { DeleteCustomerCommandHandler } from '../../../application/commandHandlers/deleteCustomerCommandHandler/deleteCustomerCommandHandler';
import { CustomerAlreadyExistsError } from '../../../application/errors/customerAlreadyExistsError';
import { CustomerNotFoundError } from '../../../application/errors/customerNotFoundError';
import { FindCustomerQueryHandler } from '../../../application/queryHandlers/findCustomerQueryHandler/findCustomerQueryHandler';
import { symbols } from '../../../symbols';

@Injectable()
export class CustomerHttpController implements HttpController {
  public readonly basePath = 'customers';

  public constructor(
    @Inject(unitOfWorkModuleSymbols.unitOfWorkFactory)
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    @Inject(symbols.createCustomerCommandHandler)
    private readonly createCustomerCommandHandler: CreateCustomerCommandHandler,
    @Inject(symbols.deleteCustomerCommandHandler)
    private readonly deleteCustomerCommandHandler: DeleteCustomerCommandHandler,
    @Inject(symbols.findCustomerQueryHandler)
    private readonly findCustomerQueryHandler: FindCustomerQueryHandler,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        method: HttpMethodName.post,
        handler: this.createCustomer.bind(this),
        schema: {
          request: {
            body: createCustomerBodySchema,
          },
          response: {
            [HttpStatusCode.created]: {
              schema: createCustomerResponseCreatedBodySchema,
            },
            [HttpStatusCode.unprocessableEntity]: {
              schema: responseErrorBodySchema,
            },
          },
        },
        authorizationType: AuthorizationType.bearerToken,
      }),
      new HttpRoute({
        method: HttpMethodName.get,
        path: ':id',
        handler: this.findCustomer.bind(this),
        schema: {
          request: {
            pathParams: findCustomerPathParametersSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findCustomerResponseOkBodySchema,
            },
            [HttpStatusCode.notFound]: {
              schema: responseErrorBodySchema,
            },
          },
        },
        authorizationType: AuthorizationType.bearerToken,
      }),
      new HttpRoute({
        method: HttpMethodName.delete,
        path: ':id',
        handler: this.deleteCustomer.bind(this),
        schema: {
          request: {
            pathParams: deleteCustomerPathParametersSchema,
          },
          response: {
            [HttpStatusCode.noContent]: {
              schema: deleteCustomerResponseNoContentBodySchema,
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

  private async createCustomer(
    request: HttpRequest<CreateCustomerBody>,
  ): Promise<
    HttpCreatedResponse<CreateCustomerResponseCreatedBody> | HttpUnprocessableEntityResponse<ResponseErrorBody>
  > {
    const { userId } = request.body;

    const unitOfWork = await this.unitOfWorkFactory.create();

    try {
      const { customer } = await unitOfWork.runInTransaction(async () => {
        return this.createCustomerCommandHandler.execute({ unitOfWork, draft: { userId } });
      });

      return { statusCode: HttpStatusCode.created, body: { customer } };
    } catch (error) {
      if (error instanceof CustomerAlreadyExistsError) {
        return { statusCode: HttpStatusCode.unprocessableEntity, body: { error } };
      }

      throw error;
    }
  }

  private async findCustomer(
    request: HttpRequest<undefined, undefined, FindCustomerPathParameters>,
  ): Promise<HttpOkResponse<FindCustomerResponseOkBody> | HttpNotFoundResponse<ResponseErrorBody>> {
    const { id } = request.pathParams;

    const unitOfWork = await this.unitOfWorkFactory.create();

    try {
      const { customer } = await unitOfWork.runInTransaction(async () => {
        return this.findCustomerQueryHandler.execute({ unitOfWork, customerId: id });
      });

      return { statusCode: HttpStatusCode.ok, body: { customer } };
    } catch (error) {
      if (error instanceof CustomerNotFoundError) {
        return { statusCode: HttpStatusCode.notFound, body: { error } };
      }

      throw error;
    }
  }

  private async deleteCustomer(
    request: HttpRequest<undefined, undefined, DeleteCustomerPathParameters>,
  ): Promise<HttpNoContentResponse<DeleteCustomerResponseNoContentBody> | HttpNotFoundResponse<ResponseErrorBody>> {
    const { id } = request.pathParams;

    const unitOfWork = await this.unitOfWorkFactory.create();

    try {
      await unitOfWork.runInTransaction(async () => {
        await this.deleteCustomerCommandHandler.execute({ unitOfWork, customerId: id });
      });
    } catch (error) {
      if (error instanceof CustomerNotFoundError) {
        return { statusCode: HttpStatusCode.notFound, body: { error } };
      }

      throw error;
    }

    return { statusCode: HttpStatusCode.noContent, body: null };
  }
}
