import { AddLineItemCommandHandler } from './addLineItemCommandHandler';
import {
  AddLineItemCommandHandlerPayload,
  addLineItemCommandHandlerPayloadSchema,
} from './payloads/addLineItemCommandHandlerPayload';
import {
  AddLineItemCommandHandlerResult,
  addLineItemCommandHandlerResultSchema,
} from './payloads/addLineItemCommandHandlerResult';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { loggerModuleSymbols } from '../../../../../../libs/logger/loggerModuleSymbols';
import { LoggerService } from '../../../../../../libs/logger/services/loggerService/loggerService';
import { UuidGenerator } from '../../../../../../libs/uuid/uuidGenerator';
import { Validator } from '../../../../../../libs/validator/validator';
import { FindBookQueryHandler } from '../../../../bookModule/application/queryHandlers/findBookQueryHandler/findBookQueryHandler';
import { bookSymbols } from '../../../../bookModule/symbols';
import { FindInventoryQueryHandler } from '../../../../inventoryModule/application/queryHandlers/findInventoryQueryHandler/findInventoryQueryHandler';
import { inventorySymbols } from '../../../../inventoryModule/symbols';
import { LineItemOutOfInventoryError } from '../../../domain/errors/lineItemOutOfInventoryError';
import { orderSymbols, symbols } from '../../../symbols';
import { FindCartQueryHandler } from '../../queryHandlers/findCartQueryHandler/findCartQueryHandler';
import { CartRepositoryFactory } from '../../repositories/cartRepository/cartRepositoryFactory';
import { LineItemRepositoryFactory } from '../../repositories/lineItemRepository/lineItemRepositoryFactory';

@Injectable()
export class AddLineItemCommandHandlerImpl implements AddLineItemCommandHandler {
  public constructor(
    @Inject(orderSymbols.cartRepositoryFactory)
    private readonly cartRepositoryFactory: CartRepositoryFactory,
    @Inject(orderSymbols.lineItemRepositoryFactory)
    private readonly lineItemRepositoryFactory: LineItemRepositoryFactory,
    @Inject(bookSymbols.findBookQueryHandler)
    private readonly findBookQueryHandler: FindBookQueryHandler,
    @Inject(symbols.findCartQueryHandler)
    private readonly findCartQueryHandler: FindCartQueryHandler,
    @Inject(inventorySymbols.findInventoryQueryHandler)
    private readonly findInventoryQueryHandler: FindInventoryQueryHandler,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(input: AddLineItemCommandHandlerPayload): Promise<AddLineItemCommandHandlerResult> {
    const {
      unitOfWork,
      cartId,
      draft: { bookId, quantity },
    } = Validator.validate(addLineItemCommandHandlerPayloadSchema, input);

    this.loggerService.debug({ message: 'Adding line item to a cart...', context: { cartId, bookId, quantity } });

    const entityManager = unitOfWork.getEntityManager();

    const lineItemRepository = this.lineItemRepositoryFactory.create(entityManager);

    const cartRepository = this.cartRepositoryFactory.create(entityManager);

    const { cart } = await this.findCartQueryHandler.execute({ unitOfWork, cartId });

    const { inventory } = await this.findInventoryQueryHandler.execute({ unitOfWork, bookId });

    if (inventory.quantity < quantity) {
      throw new LineItemOutOfInventoryError({ inventoryQuantity: inventory.quantity, lineItemQuantity: quantity });
    }

    const {
      book: { price },
    } = await this.findBookQueryHandler.execute({ unitOfWork, bookId });

    const totalLineItemPrice = price * quantity;

    await lineItemRepository.createLineItem({
      id: UuidGenerator.generateUuid(),
      cartId,
      bookId,
      quantity,
      price,
      totalPrice: totalLineItemPrice,
    });

    const cartTotalPrice = cart.totalPrice + totalLineItemPrice;

    const updatedCart = await cartRepository.updateCart({
      id: cartId,
      draft: { totalPrice: cartTotalPrice },
    });

    this.loggerService.info({ message: 'Line item added to a cart.', context: { cartId, bookId, quantity } });

    return Validator.validate(addLineItemCommandHandlerResultSchema, { cart: updatedCart });
  }
}
