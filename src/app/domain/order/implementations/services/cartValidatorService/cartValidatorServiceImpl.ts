import { Injectable, Inject } from '../../../../../libs/dependencyInjection/contracts/decorators';
import { LoggerService } from '../../../../../libs/logger/contracts/services/loggerService/loggerService';
import { loggerSymbols } from '../../../../../libs/logger/loggerSymbols';
import { Validator } from '../../../../../libs/validator/implementations/validator';
import { CartStatus } from '../../../../cart/contracts/cartStatus';
import { InventoryService } from '../../../../inventory/contracts/services/inventoryService/inventoryService';
import { inventorySymbols } from '../../../../inventory/inventorySymbols';
import { CartValidatorService } from '../../../contracts/services/cartValidatorService/cartValidatorService';
import {
  ValidatePayload,
  validatePayloadSchema,
} from '../../../contracts/services/cartValidatorService/validatePayload';
import { BillingAddressNotProvidedError } from '../../../errors/billingAddressNotProvidedError';
import { CartNotActiveError } from '../../../errors/cartNotActiveError';
import { DeliveryMethodNotProvidedError } from '../../../errors/deliveryMethodNotProvidedError';
import { InvalidTotalPriceError } from '../../../errors/invalidTotalPriceError';
import { LineItemOutOfInventoryError } from '../../../errors/lineItemOutOfInventoryError';
import { LineItemsNotProvidedError } from '../../../errors/lineItemsNotProvidedError';
import { OrderCreatorNotMatchingCustomerIdFromCart } from '../../../errors/orderCreatorNotMatchingCustomerIdFromCart';
import { ShippingAddressNotProvidedError } from '../../../errors/shippingAddressNotProvidedError';

@Injectable()
export class CartValidatorServiceImpl implements CartValidatorService {
  public constructor(
    @Inject(inventorySymbols.inventoryService)
    private readonly inventoryService: InventoryService,
    @Inject(loggerSymbols.loggerService)
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
        const inventory = await this.inventoryService.findInventory({ unitOfWork, bookId: lineItem.bookId });

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
