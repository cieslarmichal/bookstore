import { PayloadFactory } from '../../../../../common/validator/implementations/payloadFactory';
import { Injectable, Inject } from '../../../../../libs/dependencyInjection/contracts/decorators';
import { LoggerService } from '../../../../../libs/logger/contracts/services/loggerService/loggerService';
import { loggerSymbols } from '../../../../../libs/logger/loggerSymbols';
import { CartStatus } from '../../../../cart/contracts/cartStatus';
import { CartValidatorService } from '../../../contracts/services/cartValidatorService/cartValidatorService';
import {
  ValidatePayload,
  validatePayloadSchema,
} from '../../../contracts/services/cartValidatorService/validatePayload';
import { BillingAddressNotProvidedError } from '../../../errors/billingAddressNotProvidedError';
import { CartNotActiveError } from '../../../errors/cartNotActiveError';
import { DeliveryMethodNotProvidedError } from '../../../errors/deliveryMethodNotProvidedError';
import { InvalidTotalPriceError } from '../../../errors/invalidTotalPriceError';
import { LineItemsNotProvidedError } from '../../../errors/lineItemsNotProvidedError';
import { OrderCreatorNotMatchingCustomerIdFromCart } from '../../../errors/orderCreatorNotMatchingCustomerIdFromCart';
import { ShippingAddressNotProvidedError } from '../../../errors/shippingAddressNotProvidedError';

@Injectable()
export class CartValidatorServiceImpl implements CartValidatorService {
  public constructor(
    @Inject(loggerSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public validate(input: ValidatePayload): void {
    const { cart, orderCreatorId } = PayloadFactory.create(validatePayloadSchema, input);

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

    if (orderCreatorId !== orderCreatorId) {
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

    this.loggerService.info({ message: 'Cart validated.', context: { cartId } });
  }
}
