import { Router, NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { orderErrorMiddleware } from './orderErrorMiddleware';
import { CreateOrderPayload, createOrderPayloadSchema } from './payloads/createOrderPayload';
import { FindOrdersPayload, findOrdersPayloadSchema } from './payloads/findOrdersPayload';
import { HttpStatusCode } from '../../../../../common/http/httpStatusCode';
import { sendResponseMiddleware } from '../../../../../common/middlewares/sendResponseMiddleware';
import { PaginationDataBuilder } from '../../../../../common/paginationDataBuilder/paginationDataBuilder';
import { AccessTokenData } from '../../../../../common/types/accessTokenData';
import { ControllerResponse } from '../../../../../common/types/controllerResponse';
import { LocalsName } from '../../../../../common/types/localsName';
import { QueryParameterName } from '../../../../../common/types/queryParameterName';
import { Injectable, Inject } from '../../../../../libs/dependencyInjection/decorators';
import { UnitOfWorkFactory } from '../../../../../libs/unitOfWork/factories/unitOfWorkFactory/unitOfWorkFactory';
import { unitOfWorkModuleSymbols } from '../../../../../libs/unitOfWork/unitOfWorkModuleSymbols';
import { Validator } from '../../../../../libs/validator/validator';
import { customerModuleSymbols } from '../../../../customerModule/customerModuleSymbols';
import { Customer } from '../../../../customerModule/domain/entities/customer/customer';
import { AuthMiddleware } from '../../../../integrations/common/middlewares/authMiddleware';
import { CustomerService } from '../../../../tests/services/customerService';
import { OrderService } from '../../../application/services/orderService/orderService';
import { Order } from '../../../domain/entities/order/order';
import { orderModuleSymbols } from '../../../orderModuleSymbols';
import { UserIsNotCustomerError } from '../../errors/userIsNotCustomerError';

@Injectable()
export class OrderController {
  public readonly router = Router();
  private readonly ordersEndpoint = '/orders';

  public constructor(
    @Inject(unitOfWorkModuleSymbols.unitOfWorkFactory)
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    @Inject(orderModuleSymbols.orderService)
    private readonly orderService: OrderService,
    @Inject(customerModuleSymbols.customerService)
    private readonly customerService: CustomerService,
  ) {
    const verifyAccessToken = authMiddleware.verifyToken.bind(authMiddleware);

    this.router.post(
      this.ordersEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { cartId, paymentMethod } = request.body;

        const accessTokenData: AccessTokenData = response.locals[LocalsName.accessTokenData];

        const order = await this.createOrder({
          cartId,
          paymentMethod,
          accessTokenData,
        });

        const controllerResponse: ControllerResponse = { data: { order }, statusCode: HttpStatusCode.created };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.get(
      this.ordersEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const accessTokenData: AccessTokenData = response.locals[LocalsName.accessTokenData];

        const page = Number(request.query[QueryParameterName.page] ?? 0);

        const limit = Number(request.query[QueryParameterName.limit] ?? 0);

        const pagination = this.paginationDataBuilder.build({ page, limit });

        const orders = await this.findOrders({ accessTokenData, pagination });

        const controllerResponse: ControllerResponse = { data: { orders }, statusCode: HttpStatusCode.ok };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.use(sendResponseMiddleware);

    this.router.use(orderErrorMiddleware);
  }

  private async createOrder(input: CreateOrderPayload): Promise<Order> {
    const { cartId, paymentMethod, accessTokenData } = Validator.validate(createOrderPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    const order = await unitOfWork.runInTransaction(async () => {
      const { userId } = accessTokenData;

      let customer: Customer;

      try {
        customer = await this.customerService.findCustomer({ unitOfWork, userId });
      } catch (error) {
        throw new UserIsNotCustomerError({ userId });
      }

      return this.orderService.createOrder({
        unitOfWork,
        draft: { cartId, paymentMethod, orderCreatorId: customer.id },
      });
    });

    return order;
  }

  private async findOrders(input: FindOrdersPayload): Promise<Order[]> {
    const { accessTokenData, pagination } = Validator.validate(findOrdersPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    const order = await unitOfWork.runInTransaction(async () => {
      const { userId } = accessTokenData;

      let customer: Customer;

      try {
        customer = await this.customerService.findCustomer({ unitOfWork, userId });
      } catch (error) {
        throw new UserIsNotCustomerError({ userId });
      }

      const customerOrder = await this.orderService.findOrders({ unitOfWork, pagination, customerId: customer.id });

      return customerOrder;
    });

    return order;
  }
}
