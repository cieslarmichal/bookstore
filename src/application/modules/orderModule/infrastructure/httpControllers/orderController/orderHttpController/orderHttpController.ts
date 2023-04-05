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
import { Inject } from '../../../../../../../libs/dependencyInjection/decorators';
import { UnitOfWorkFactory } from '../../../../../../../libs/unitOfWork/factories/unitOfWorkFactory/unitOfWorkFactory';
import { unitOfWorkModuleSymbols } from '../../../../../../../libs/unitOfWork/unitOfWorkModuleSymbols';
import { CustomerService } from '../../../../../customerModule/application/services/customerService/customerService';
import { customerModuleSymbols } from '../../../../../customerModule/customerModuleSymbols';
import { Customer } from '../../../../../customerModule/domain/entities/customer/customer';
import { OrderService } from '../../../../application/services/orderService/orderService';
import { Order } from '../../../../domain/entities/order/order';
import { orderModuleSymbols } from '../../../../orderModuleSymbols';
import { UserIsNotCustomerError } from '../../../errors/userIsNotCustomerError';

export class OrderHttpController implements HttpController {
  public readonly basePath = 'orders';

  public constructor(
    @Inject(unitOfWorkModuleSymbols.unitOfWorkFactory)
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    @Inject(orderModuleSymbols.orderService)
    private readonly orderService: OrderService,
    @Inject(customerModuleSymbols.customerService)
    private readonly customerService: CustomerService,
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
        handler: this.findOrders.bind(this),
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

    let order: Order | undefined;

    try {
      order = await unitOfWork.runInTransaction(async () => {
        const { userId } = request.context;

        let customer: Customer;

        try {
          customer = await this.customerService.findCustomer({ unitOfWork, userId });
        } catch (error) {
          throw new UserIsNotCustomerError({ userId: userId as string });
        }

        return this.orderService.createOrder({
          unitOfWork,
          draft: { cartId, paymentMethod, orderCreatorId: customer.id },
        });
      });
    } catch (error) {
      if (error instanceof UserIsNotCustomerError) {
        return { statusCode: HttpStatusCode.forbidden, body: { error } };
      }

      throw error;
    }

    return { statusCode: HttpStatusCode.created, body: { order } };
  }

  private async findOrders(
    request: HttpRequest<undefined, FindOrdersQueryParameters>,
  ): Promise<HttpOkResponse<FindOrdersResponseOkBody> | HttpForbiddenResponse<ResponseErrorBody>> {
    const { limit, page } = request.queryParams;

    const { userId } = request.context;

    const pagination = PaginationDataBuilder.build({ page: page ?? 0, limit: limit ?? 0 });

    const unitOfWork = await this.unitOfWorkFactory.create();

    let orders: Order[] = [];

    try {
      orders = await unitOfWork.runInTransaction(async () => {
        let customer: Customer;

        try {
          customer = await this.customerService.findCustomer({ unitOfWork, userId });
        } catch (error) {
          throw new UserIsNotCustomerError({ userId: userId as string });
        }

        return this.orderService.findOrders({ unitOfWork, pagination, customerId: customer.id });
      });
    } catch (error) {
      if (error instanceof UserIsNotCustomerError) {
        return { statusCode: HttpStatusCode.forbidden, body: { error } };
      }

      throw error;
    }

    return { statusCode: HttpStatusCode.ok, body: { data: orders } };
  }
}
