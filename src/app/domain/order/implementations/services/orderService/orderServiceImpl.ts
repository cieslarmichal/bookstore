import { PayloadFactory } from '../../../../../common/validator/implementations/payloadFactory';
import { Injectable, Inject } from '../../../../../libs/dependencyInjection/contracts/decorators';
import { LoggerService } from '../../../../../libs/logger/contracts/services/loggerService/loggerService';
import { loggerSymbols } from '../../../../../libs/logger/loggerSymbols';
import { UuidGenerator } from '../../../../../libs/uuid/implementations/uuidGenerator';
import { cartSymbols } from '../../../../cart/cartSymbols';
import { CartService } from '../../../../cart/contracts/services/cartService/cartService';
import { OrderRepositoryFactory } from '../../../contracts/factories/orderRepositoryFactory/orderRepositoryFactory';
import { Order } from '../../../contracts/order';
import { OrderStatus } from '../../../contracts/orderStatus';
import { CartValidatorService } from '../../../contracts/services/cartValidatorService/cartValidatorService';
import {
  CreateOrderPayload,
  createOrderPayloadSchema,
} from '../../../contracts/services/orderService/createOrderPayload';
import { FindOrdersPayload, findOrdersPayloadSchema } from '../../../contracts/services/orderService/findOrdersPayload';
import { OrderService } from '../../../contracts/services/orderService/orderService';
import { orderSymbols } from '../../../orderSymbols';

@Injectable()
export class OrderServiceImpl implements OrderService {
  public constructor(
    @Inject(orderSymbols.orderRepositoryFactory)
    private readonly orderRepositoryFactory: OrderRepositoryFactory,
    @Inject(loggerSymbols.loggerService)
    private readonly loggerService: LoggerService,
    @Inject(cartSymbols.cartService)
    private readonly cartService: CartService,
    @Inject(orderSymbols.cartValidatorService)
    private readonly cartValidatorService: CartValidatorService,
  ) {}

  public async createOrder(input: CreateOrderPayload): Promise<Order> {
    const {
      unitOfWork,
      draft: { cartId, paymentMethod },
    } = PayloadFactory.create(createOrderPayloadSchema, input);

    const entityManager = unitOfWork.getEntityManager();

    const orderRepository = this.orderRepositoryFactory.create(entityManager);

    const cart = await this.cartService.findCart({ unitOfWork, cartId });

    this.loggerService.debug({
      message: 'Creating order...',
      context: { cartId, paymentMethod, customerId: cart.customerId },
    });

    this.cartValidatorService.validate({ cart });

    const order = await orderRepository.createOne({
      id: UuidGenerator.generateUuid(),
      customerId: cart.customerId,
      cartId,
      orderNumber: UuidGenerator.generateUuid(),
      paymentMethod,
      status: OrderStatus.created,
    });

    this.loggerService.info({
      message: 'Order created.',
      context: { orderId: order.id, cartId, paymentMethod, customerId: cart.customerId },
    });

    return order;
  }

  public async findOrders(input: FindOrdersPayload): Promise<Order[]> {
    const { unitOfWork, customerId, pagination } = PayloadFactory.create(findOrdersPayloadSchema, input);

    const entityManager = unitOfWork.getEntityManager();

    const orderRepository = this.orderRepositoryFactory.create(entityManager);

    const orders = await orderRepository.findMany({ customerId, pagination });

    return orders;
  }
}
