import { CreateOrderCommandHandler } from './createOrderCommandHandler';
import {
  CreateOrderCommandHandlerPayload,
  createOrderCommandHandlerPayloadSchema,
} from './payloads/createOrderCommandHandlerPayload';
import {
  CreateOrderCommandHandlerResult,
  createOrderCommandHandlerResultSchema,
} from './payloads/createOrderCommandHandlerResult';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { loggerModuleSymbols } from '../../../../../../libs/logger/loggerModuleSymbols';
import { LoggerService } from '../../../../../../libs/logger/services/loggerService/loggerService';
import { UuidGenerator } from '../../../../../../libs/uuid/uuidGenerator';
import { Validator } from '../../../../../../libs/validator/validator';
import { UpdateInventoryCommandHandler } from '../../../../inventoryModule/application/commandHandlers/updateInventoryCommandHandler/updateInventoryCommandHandler';
import { FindInventoryQueryHandler } from '../../../../inventoryModule/application/queryHandlers/findInventoryQueryHandler/findInventoryQueryHandler';
import { inventorySymbols } from '../../../../inventoryModule/symbols';
import { CartStatus } from '../../../domain/entities/cart/cartStatus';
import { LineItem } from '../../../domain/entities/lineItem/lineItem';
import { OrderStatus } from '../../../domain/entities/order/orderStatus';
import { symbols } from '../../../symbols';
import { UpdateCartCommandHandler } from '../../commandHandlers/updateCartCommandHandler/updateCartCommandHandler';
import { FindCartQueryHandler } from '../../queryHandlers/findCartQueryHandler/findCartQueryHandler';
import { OrderRepositoryFactory } from '../../repositories/orderRepository/orderRepositoryFactory';
import { CartValidatorService } from '../../services/cartValidatorService/cartValidatorService';

@Injectable()
export class CreateOrderCommandHandlerImpl implements CreateOrderCommandHandler {
  public constructor(
    @Inject(symbols.orderRepositoryFactory)
    private readonly orderRepositoryFactory: OrderRepositoryFactory,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
    @Inject(symbols.findCartQueryHandler)
    private readonly findCartQueryHandler: FindCartQueryHandler,
    @Inject(symbols.updateCartCommandHandler)
    private readonly updateCartCommandHandler: UpdateCartCommandHandler,
    @Inject(inventorySymbols.findInventoryQueryHandler)
    private readonly findInventoryQueryHandler: FindInventoryQueryHandler,
    @Inject(inventorySymbols.updateInventoryCommandHandler)
    private readonly updateInventoryCommandHandler: UpdateInventoryCommandHandler,
    @Inject(symbols.cartValidatorService)
    private readonly cartValidatorService: CartValidatorService,
  ) {}

  public async execute(input: CreateOrderCommandHandlerPayload): Promise<CreateOrderCommandHandlerResult> {
    const {
      unitOfWork,
      draft: { cartId, paymentMethod, orderCreatorId },
    } = Validator.validate(createOrderCommandHandlerPayloadSchema, input);

    const entityManager = unitOfWork.getEntityManager();

    const orderRepository = this.orderRepositoryFactory.create(entityManager);

    const { cart } = await this.findCartQueryHandler.execute({ unitOfWork, cartId });

    this.loggerService.debug({
      message: 'Creating order...',
      context: { cartId, paymentMethod, customerId: cart.customerId },
    });

    await this.cartValidatorService.validate({ unitOfWork, cart, orderCreatorId });

    const order = await orderRepository.createOrder({
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
        const { inventory } = await this.findInventoryQueryHandler.execute({
          unitOfWork,
          bookId: lineItem.bookId,
        });

        const updatedQuantity = inventory.quantity - lineItem.quantity;

        await this.updateInventoryCommandHandler.execute({
          unitOfWork,
          inventoryId: inventory.id,
          draft: { quantity: updatedQuantity },
        });
      }),
    );

    await this.updateCartCommandHandler.execute({ unitOfWork, cartId, draft: { status: CartStatus.inactive } });

    this.loggerService.info({
      message: 'Order created.',
      context: { orderId: order.id, cartId, paymentMethod, customerId: cart.customerId },
    });

    return Validator.validate(createOrderCommandHandlerResultSchema, { order });
  }
}
