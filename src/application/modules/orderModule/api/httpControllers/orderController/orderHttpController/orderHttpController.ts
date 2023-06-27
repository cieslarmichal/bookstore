import {
  createOrderResponseCreatedBodySchema,
  CreateOrderBody,
  CreateOrderResponseCreatedBody,
  createOrderBodySchema,
} from './schemas/createOrderSchema';
import {
  FindOrdersQueryParameters,
  FindOrdersResponseOkBody,
  findOrdersQueryParametersSchema,
  findOrdersResponseOkBodySchema,
} from './schemas/findOrdersSchema';
import { AuthorizationType } from '../../../../../../../common/http/authorizationType';
import { HttpController } from '../../../../../../../common/http/httpController';
import { HttpMethodName } from '../../../../../../../common/http/httpMethodName';
import { HttpRequest } from '../../../../../../../common/http/httpRequest';
import {
  HttpCreatedResponse,
  HttpForbiddenResponse,
  HttpOkResponse,
} from '../../../../../../../common/http/httpResponse';
import { HttpRoute } from '../../../../../../../common/http/httpRoute';
import { HttpStatusCode } from '../../../../../../../common/http/httpStatusCode';
import { responseErrorBodySchema, ResponseErrorBody } from '../../../../../../../common/http/responseErrorBodySchema';
import { PaginationDataBuilder } from '../../../../../../../common/paginationDataBuilder/paginationDataBuilder';
import { Inject, Injectable } from '../../../../../../../libs/dependencyInjection/decorators';
import { UnitOfWorkFactory } from '../../../../../../../libs/unitOfWork/factories/unitOfWorkFactory/unitOfWorkFactory';
import { unitOfWorkModuleSymbols } from '../../../../../../../libs/unitOfWork/unitOfWorkModuleSymbols';
import { FindCustomerQueryHandler } from '../../../../../customerModule/application/queryHandlers/findCustomerQueryHandler/findCustomerQueryHandler';
import { Customer } from '../../../../../customerModule/domain/entities/customer/customer';
import { customerSymbols } from '../../../../../customerModule/symbols';
import { CreateOrderCommandHandler } from '../../../../application/commandHandlers/createOrderCommandHandler/createOrderCommandHandler';
import { UserIsNotCustomerError } from '../../../../application/errors/userIsNotCustomerError';
import { FindOrdersQueryHandler } from '../../../../application/queryHandlers/findOrdersQueryHandler/findOrdersQueryHandler';
import { symbols } from '../../../../symbols';

@Injectable()
export class OrderHttpController implements HttpController {
  public readonly basePath = 'orders';

  public constructor(
    @Inject(unitOfWorkModuleSymbols.unitOfWorkFactory)
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    @Inject(customerSymbols.findCustomerQueryHandler)
    private readonly findCustomerQueryHandler: FindCustomerQueryHandler,
    @Inject(symbols.createOrderCommandHandler)
    private readonly createOrderCommandHandler: CreateOrderCommandHandler,
    @Inject(symbols.findOrdersQueryHandler)
    private readonly findOrdersQueryHandler: FindOrdersQueryHandler,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        method: HttpMethodName.post,
        handler: this.createOrder.bind(this),
        schema: {
          request: {
            body: createOrderBodySchema,
          },
          response: {
            [HttpStatusCode.created]: {
              schema: createOrderResponseCreatedBodySchema,
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
        handler: this.findCustomerOrders.bind(this),
        schema: {
          request: {
            queryParams: findOrdersQueryParametersSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findOrdersResponseOkBodySchema,
            },
            [HttpStatusCode.forbidden]: {
              schema: responseErrorBodySchema,
            },
          },
        },
        authorizationType: AuthorizationType.bearerToken,
      }),
    ];
  }

  private async createOrder(
    request: HttpRequest<CreateOrderBody>,
  ): Promise<HttpCreatedResponse<CreateOrderResponseCreatedBody> | HttpForbiddenResponse<ResponseErrorBody>> {
    const { cartId, paymentMethod } = request.body;

    const unitOfWork = await this.unitOfWorkFactory.create();

    try {
      const { order } = await unitOfWork.runInTransaction(async () => {
        const { userId } = request.context;

        let customer: Customer;

        try {
          const result = await this.findCustomerQueryHandler.execute({ unitOfWork, userId });

          customer = result.customer;
        } catch (error) {
          throw new UserIsNotCustomerError({ userId: userId as string });
        }

        return this.createOrderCommandHandler.execute({
          unitOfWork,
          draft: { cartId, paymentMethod, orderCreatorId: customer.id },
        });
      });

      return { statusCode: HttpStatusCode.created, body: { order } };
    } catch (error) {
      if (error instanceof UserIsNotCustomerError) {
        return { statusCode: HttpStatusCode.forbidden, body: { error } };
      }

      throw error;
    }
  }

  private async findCustomerOrders(
    request: HttpRequest<undefined, FindOrdersQueryParameters>,
  ): Promise<HttpOkResponse<FindOrdersResponseOkBody> | HttpForbiddenResponse<ResponseErrorBody>> {
    const { limit, page } = request.queryParams;

    const { userId } = request.context;

    const pagination = PaginationDataBuilder.build({ page: Number(page) ?? 0, limit: Number(limit) ?? 0 });

    const unitOfWork = await this.unitOfWorkFactory.create();

    try {
      const { orders } = await unitOfWork.runInTransaction(async () => {
        let customer: Customer;

        try {
          const result = await this.findCustomerQueryHandler.execute({ unitOfWork, userId });

          customer = result.customer;
        } catch (error) {
          throw new UserIsNotCustomerError({ userId: userId as string });
        }

        return this.findOrdersQueryHandler.execute({ unitOfWork, pagination, customerId: customer.id });
      });

      return { statusCode: HttpStatusCode.ok, body: { data: orders } };
    } catch (error) {
      if (error instanceof UserIsNotCustomerError) {
        return { statusCode: HttpStatusCode.forbidden, body: { error } };
      }

      throw error;
    }
  }
}
