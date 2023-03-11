import { Router, NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { orderErrorMiddleware } from './orderErrorMiddleware';
import { HttpStatusCode } from '../../../../common/http/contracts/httpStatusCode';
import { Customer } from '../../../domain/customer/contracts/customer';
import { CustomerService } from '../../../domain/customer/contracts/services/customerService/customerService';
import { customerSymbols } from '../../../domain/customer/customerSymbols';
import { Order } from '../../../domain/order/contracts/order';
import { OrderService } from '../../../domain/order/contracts/services/orderService/orderService';
import { orderSymbols } from '../../../domain/order/orderSymbols';
import { Inject, Injectable } from '../../../../libs/dependencyInjection/contracts/decorators';
import { UnitOfWorkFactory } from '../../../../libs/unitOfWork/contracts/factories/unitOfWorkFactory/unitOfWorkFactory';
import { unitOfWorkSymbols } from '../../../../libs/unitOfWork/unitOfWorkSymbols';
import { Validator } from '../../../../libs/validator/implementations/validator';
import { AccessTokenData } from '../../accessTokenData';
import { AuthMiddleware } from '../../common/middlewares/authMiddleware';
import { sendResponseMiddleware } from '../../common/middlewares/sendResponseMiddleware';
import { PaginationDataBuilder } from '../../common/paginationDataBuilder/paginationDataBuilder';
import { ControllerResponse } from '../../controllerResponse';
import { integrationsSymbols } from '../../integrationsSymbols';
import { LocalsName } from '../../localsName';
import { QueryParameterName } from '../../queryParameterName';
import { CreateOrderPayload, createOrderPayloadSchema } from '../contracts/createOrderPayload';
import { FindOrdersPayload, findOrdersPayloadSchema } from '../contracts/findOrdersPayload';
import { UserIsNotCustomerError } from '../errors/userIsNotCustomerError';

@Injectable()
export class OrderController {
  public readonly router = Router();
  private readonly ordersEndpoint = '/orders';

  public constructor(
    @Inject(unitOfWorkSymbols.unitOfWorkFactory)
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    @Inject(orderSymbols.orderService)
    private readonly orderService: OrderService,
    @Inject(customerSymbols.customerService)
    private readonly customerService: CustomerService,
    @Inject(integrationsSymbols.authMiddleware)
    authMiddleware: AuthMiddleware,
    @Inject(integrationsSymbols.paginationDataBuilder)
    private paginationDataBuilder: PaginationDataBuilder,
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
