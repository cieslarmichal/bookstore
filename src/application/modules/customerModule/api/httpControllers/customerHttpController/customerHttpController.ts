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
import { Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { UnitOfWorkFactory } from '../../../../../../libs/unitOfWork/factories/unitOfWorkFactory/unitOfWorkFactory';
import { unitOfWorkModuleSymbols } from '../../../../../../libs/unitOfWork/unitOfWorkModuleSymbols';
import { CustomerService } from '../../../application/services/customerService/customerService';
import { customerModuleSymbols } from '../../../customerModuleSymbols';
import { Customer } from '../../../domain/entities/customer/customer';
import { CustomerAlreadyExistsError } from '../../../infrastructure/errors/customerAlreadyExistsError';
import { CustomerNotFoundError } from '../../../infrastructure/errors/customerNotFoundError';

export class CustomerHttpController implements HttpController {
  public readonly basePath = 'customers';

  public constructor(
    @Inject(unitOfWorkModuleSymbols.unitOfWorkFactory)
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    @Inject(customerModuleSymbols.customerService)
    private readonly customerService: CustomerService,
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

    let customer: Customer | undefined;

    try {
      customer = await unitOfWork.runInTransaction(async () => {
        return this.customerService.createCustomer({ unitOfWork, draft: { userId } });
      });
    } catch (error) {
      if (error instanceof CustomerAlreadyExistsError) {
        return { statusCode: HttpStatusCode.unprocessableEntity, body: { error } };
      }

      throw error;
    }

    return { statusCode: HttpStatusCode.created, body: { customer } };
  }

  private async findCustomer(
    request: HttpRequest<undefined, undefined, FindCustomerPathParameters>,
  ): Promise<HttpOkResponse<FindCustomerResponseOkBody> | HttpNotFoundResponse<ResponseErrorBody>> {
    const { id } = request.pathParams;

    const unitOfWork = await this.unitOfWorkFactory.create();

    let customer: Customer | undefined;

    try {
      customer = await unitOfWork.runInTransaction(async () => {
        return this.customerService.findCustomer({ unitOfWork, customerId: id });
      });
    } catch (error) {
      if (error instanceof CustomerNotFoundError) {
        return { statusCode: HttpStatusCode.notFound, body: { error } };
      }

      throw error;
    }

    return { statusCode: HttpStatusCode.ok, body: { customer } };
  }

  private async deleteCustomer(
    request: HttpRequest<undefined, undefined, DeleteCustomerPathParameters>,
  ): Promise<HttpNoContentResponse<DeleteCustomerResponseNoContentBody> | HttpNotFoundResponse<ResponseErrorBody>> {
    const { id } = request.pathParams;

    const unitOfWork = await this.unitOfWorkFactory.create();

    try {
      await unitOfWork.runInTransaction(async () => {
        await this.customerService.deleteCustomer({ unitOfWork, customerId: id });
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
