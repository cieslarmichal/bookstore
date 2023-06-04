import {
  RemoveLineItemCommandHandlerPayload,
  removeLineItemCommandHandlerPayloadSchema,
} from './payloads/removeLineItemCommandHandlerPayload';
import {
  RemoveLineItemCommandHandlerResult,
  removeLineItemCommandHandlerResultSchema,
} from './payloads/removeLineItemCommandHandlerResult';
import { RemoveLineItemCommandHandler } from './removeLineItemCommandHandler';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { loggerModuleSymbols } from '../../../../../../libs/logger/loggerModuleSymbols';
import { LoggerService } from '../../../../../../libs/logger/services/loggerService/loggerService';
import { Validator } from '../../../../../../libs/validator/validator';
import { LineItemNotFoundError } from '../../errors/lineItemNotFoundError';
import { orderSymbols, symbols } from '../../../symbols';
import { FindCartQueryHandler } from '../../queryHandlers/findCartQueryHandler/findCartQueryHandler';
import { CartRepositoryFactory } from '../../repositories/cartRepository/cartRepositoryFactory';
import { LineItemRepositoryFactory } from '../../repositories/lineItemRepository/lineItemRepositoryFactory';

@Injectable()
export class RemoveLineItemCommandHandlerImpl implements RemoveLineItemCommandHandler {
  public constructor(
    @Inject(orderSymbols.cartRepositoryFactory)
    private readonly cartRepositoryFactory: CartRepositoryFactory,
    @Inject(orderSymbols.lineItemRepositoryFactory)
    private readonly lineItemRepositoryFactory: LineItemRepositoryFactory,
    @Inject(symbols.findCartQueryHandler)
    private readonly findCartQueryHandler: FindCartQueryHandler,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(input: RemoveLineItemCommandHandlerPayload): Promise<RemoveLineItemCommandHandlerResult> {
    const {
      unitOfWork,
      cartId,
      draft: { lineItemId, quantity },
    } = Validator.validate(removeLineItemCommandHandlerPayloadSchema, input);

    this.loggerService.debug({
      message: 'Removing line item from a cart...',
      context: { cartId, lineItemId, quantity },
    });

    const entityManager = unitOfWork.getEntityManager();

    const lineItemRepository = this.lineItemRepositoryFactory.create(entityManager);

    const cartRepository = this.cartRepositoryFactory.create(entityManager);

    const { cart } = await this.findCartQueryHandler.execute({ unitOfWork, cartId });

    const existingLineItem = await lineItemRepository.findLineItem({ id: lineItemId });

    if (!existingLineItem) {
      throw new LineItemNotFoundError({ id: lineItemId });
    }

    let totalLineItemPrice: number;

    if (existingLineItem.quantity <= quantity) {
      totalLineItemPrice = existingLineItem.totalPrice;

      await lineItemRepository.deleteLineItem({ id: lineItemId });
    } else {
      const updatedQuantity = existingLineItem.quantity - quantity;

      totalLineItemPrice = existingLineItem.price * updatedQuantity;

      await lineItemRepository.updateLineItem({
        id: lineItemId,
        draft: { quantity: updatedQuantity, totalPrice: totalLineItemPrice },
      });
    }

    const cartTotalPrice = cart.totalPrice - totalLineItemPrice;

    const updatedCart = await cartRepository.updateCart({
      id: cartId,
      draft: { totalPrice: cartTotalPrice },
    });

    this.loggerService.info({ message: 'Line item removed from a cart.', context: { cartId, lineItemId, quantity } });

    return Validator.validate(removeLineItemCommandHandlerResultSchema, { cart: updatedCart });
  }
}
