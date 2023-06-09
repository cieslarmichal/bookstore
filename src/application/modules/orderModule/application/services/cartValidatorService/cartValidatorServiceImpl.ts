import { CartValidatorService } from './cartValidatorService';
import { ValidatePayload, validatePayloadSchema } from './payloads/validatePayload';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { loggerModuleSymbols } from '../../../../../../libs/logger/loggerModuleSymbols';
import { LoggerService } from '../../../../../../libs/logger/services/loggerService/loggerService';
import { Validator } from '../../../../../../libs/validator/validator';
import { FindInventoryQueryHandler } from '../../../../inventoryModule/application/queryHandlers/findInventoryQueryHandler/findInventoryQueryHandler';
import { inventorySymbols } from '../../../../inventoryModule/symbols';
import { CartStatus } from '../../../domain/entities/cart/cartStatus';
import { BillingAddressNotProvidedError } from '../../../domain/errors/billingAddressNotProvidedError';
import { CartNotActiveError } from '../../../domain/errors/cartNotActiveError';
import { DeliveryMethodNotProvidedError } from '../../../domain/errors/deliveryMethodNotProvidedError';
import { InvalidTotalPriceError } from '../../../domain/errors/invalidTotalPriceError';
import { LineItemOutOfInventoryError } from '../../../domain/errors/lineItemOutOfInventoryError';
import { LineItemsNotProvidedError } from '../../../domain/errors/lineItemsNotProvidedError';
import { OrderCreatorNotMatchingCustomerIdFromCart } from '../../../domain/errors/orderCreatorNotMatchingCustomerIdFromCart';
import { ShippingAddressNotProvidedError } from '../../../domain/errors/shippingAddressNotProvidedError';

@Injectable()
export class CartValidatorServiceImpl implements CartValidatorService {
  public constructor(
    @Inject(inventorySymbols.findInventoryQueryHandler)
    private readonly findInventoryQueryHandler: FindInventoryQueryHandler,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async validate(input: ValidatePayload): Promise<void> {
    const { unitOfWork, cart, orderCreatorId } = Validator.validate(validatePayloadSchema, input);

    const {
      id: cartId,
      status,
      billingAddressId,
      shippingAddressId,
      deliveryMethod,
      totalPrice,
      lineItems,
      customerId,
    } = cart;

    this.loggerService.debug({
      message: 'Validating cart...',
      context: {
        cartId,
        status,
        billingAddressId,
        shippingAddressId,
        deliveryMethod,
        totalPrice,
        lineItems,
        customerId,
        orderCreatorId,
      },
    });

    if (customerId !== orderCreatorId) {
      throw new OrderCreatorNotMatchingCustomerIdFromCart({ orderCreatorId, cartCustomerId: customerId });
    }

    if (status === CartStatus.inactive) {
      throw new CartNotActiveError({ cartId });
    }

    if (!billingAddressId) {
      throw new BillingAddressNotProvidedError({ cartId });
    }

    if (!shippingAddressId) {
      throw new ShippingAddressNotProvidedError({ cartId });
    }

    if (!deliveryMethod) {
      throw new DeliveryMethodNotProvidedError({ cartId });
    }

    if (!lineItems || !lineItems.length) {
      throw new LineItemsNotProvidedError({ cartId });
    }

    const sumOfLineItemsPrices = lineItems.reduce((sum, lineItem) => sum + lineItem.totalPrice, 0);

    if (totalPrice !== sumOfLineItemsPrices) {
      throw new InvalidTotalPriceError({ cartId, totalPrice, sumOfLineItemsPrices });
    }

    await Promise.all(
      lineItems.map(async (lineItem) => {
        const { inventory } = await this.findInventoryQueryHandler.execute({ unitOfWork, bookId: lineItem.bookId });

        if (inventory.quantity < lineItem.quantity) {
          throw new LineItemOutOfInventoryError({
            inventoryQuantity: inventory.quantity,
            lineItemQuantity: lineItem.quantity,
          });
        }
      }),
    );

    this.loggerService.info({ message: 'Cart validated.', context: { cartId } });
  }
}
