import { OrderService } from './orderService';
import { CreateOrderPayload, createOrderPayloadSchema } from './payloads/createOrderPayload';
import { FindOrdersPayload, findOrdersPayloadSchema } from './payloads/findOrdersPayload';
import { Injectable, Inject } from '../../../../../libs/dependencyInjection/decorators';
import { loggerModuleSymbols } from '../../../../../libs/logger/loggerModuleSymbols';
import { LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService';
import { UuidGenerator } from '../../../../../libs/uuid/uuidGenerator';
import { Validator } from '../../../../../libs/validator/validator';
import { InventoryService } from '../../../../inventoryModule/application/services/inventoryService/inventoryService';
import { inventoryModuleSymbols } from '../../../../inventoryModule/inventoryModuleSymbols';
import { CartStatus } from '../../../domain/entities/cart/cartStatus';
import { LineItem } from '../../../domain/entities/lineItem/lineItem';
import { Order } from '../../../domain/entities/order/order';
import { OrderStatus } from '../../../domain/entities/order/orderStatus';
import { orderModuleSymbols } from '../../../orderModuleSymbols';
import { OrderRepositoryFactory } from '../../repositories/orderRepository/orderRepositoryFactory';
import { CartService } from '../cartService/cartService';
import { CartValidatorService } from '../cartValidatorService/cartValidatorService';

@Injectable()
export class OrderServiceImpl implements OrderService {
  public constructor(
    @Inject(orderModuleSymbols.orderRepositoryFactory)
    private readonly orderRepositoryFactory: OrderRepositoryFactory,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
    @Inject(orderModuleSymbols.cartService)
    private readonly cartService: CartService,
    @Inject(inventoryModuleSymbols.inventoryService)
    private readonly inventoryService: InventoryService,
    @Inject(orderModuleSymbols.cartValidatorService)
    private readonly cartValidatorService: CartValidatorService,
  ) {}

  public async createOrder(input: CreateOrderPayload): Promise<Order> {
    const {
      unitOfWork,
      draft: { cartId, paymentMethod, orderCreatorId },
    } = Validator.validate(createOrderPayloadSchema, input);

    const entityManager = unitOfWork.getEntityManager();

    const orderRepository = this.orderRepositoryFactory.create(entityManager);

    const cart = await this.cartService.findCart({ unitOfWork, cartId });

    this.loggerService.debug({
      message: 'Creating order...',
      context: { cartId, paymentMethod, customerId: cart.customerId },
    });

    await this.cartValidatorService.validate({ unitOfWork, cart, orderCreatorId });

    const order = await orderRepository.createOne({
      id: UuidGenerator.generateUuid(),
      customerId: cart.customerId,
      cartId,
      orderNumber: UuidGenerator.generateUuid(),
      paymentMethod,
      status: OrderStatus.created,
    });

    const lineItems = cart.lineItems as LineItem[];

    await Promise.all(
      lineItems.map(async (lineItem) => {
        const inventory = await this.inventoryService.findInventory({ unitOfWork, bookId: lineItem.bookId });

        const updatedQuantity = inventory.quantity - lineItem.quantity;

        await this.inventoryService.updateInventory({
          unitOfWork,
          inventoryId: inventory.id,
          draft: { quantity: updatedQuantity },
        });
      }),
    );

    await this.cartService.updateCart({ unitOfWork, cartId, draft: { status: CartStatus.inactive } });

    this.loggerService.info({
      message: 'Order created.',
      context: { orderId: order.id, cartId, paymentMethod, customerId: cart.customerId },
    });

    return order;
  }

  public async findOrders(input: FindOrdersPayload): Promise<Order[]> {
    const { unitOfWork, customerId, pagination } = Validator.validate(findOrdersPayloadSchema, input);

    const entityManager = unitOfWork.getEntityManager();

    const orderRepository = this.orderRepositoryFactory.create(entityManager);

    const orders = await orderRepository.findMany({ customerId, pagination });

    return orders;
  }
}
