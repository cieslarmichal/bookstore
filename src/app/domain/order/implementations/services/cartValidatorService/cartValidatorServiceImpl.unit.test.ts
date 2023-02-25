import 'reflect-metadata';
import { CartValidatorServiceImpl } from './cartValidatorServiceImpl';
import { DummyFactory } from '../../../../../common/tests/implementations/dummyFactory';
import { LoggerService } from '../../../../../libs/logger/contracts/services/loggerService/loggerService';
import { CartStatus } from '../../../../cart/contracts/cartStatus';
import { CartTestFactory } from '../../../../cart/tests/factories/cartTestFactory/cartTestFactory';
import { LineItemTestFactory } from '../../../../lineItem/tests/factories/lineItemTestFactory/lineItemTestFactory';
import { BillingAddressNotProvidedError } from '../../../errors/billingAddressNotProvidedError';
import { CartNotActiveError } from '../../../errors/cartNotActiveError';
import { DeliveryMethodNotProvidedError } from '../../../errors/deliveryMethodNotProvidedError';
import { InvalidTotalPriceError } from '../../../errors/invalidTotalPriceError';
import { LineItemsNotProvidedError } from '../../../errors/lineItemsNotProvidedError';
import { ShippingAddressNotProvidedError } from '../../../errors/shippingAddressNotProvidedError';

describe('CartValidatorServiceImpl', () => {
  let loggerService: LoggerService;
  let cartValidatorServiceImpl: CartValidatorServiceImpl;

  const lineItemTestFactory = new LineItemTestFactory();
  const cartTestFactory = new CartTestFactory(lineItemTestFactory);

  beforeAll(async () => {
    loggerService = new DummyFactory().create();
    cartValidatorServiceImpl = new CartValidatorServiceImpl(loggerService);
  });

  it('should throw an error when order creator id does not match customer id from cart', async () => {
    expect.assertions(1);

    const cart = cartTestFactory.create();

    const { customerId: orderCreatorId } = cartTestFactory.create();

    try {
      cartValidatorServiceImpl.validate({ cart, orderCreatorId });
    } catch (error) {
      expect(error).toBeInstanceOf(CartNotActiveError);
    }
  });

  it('should throw an error when cart is not active', async () => {
    expect.assertions(1);

    const cart = cartTestFactory.create({ status: CartStatus.inactive });

    try {
      cartValidatorServiceImpl.validate({ cart, orderCreatorId: cart.customerId });
    } catch (error) {
      expect(error).toBeInstanceOf(CartNotActiveError);
    }
  });

  it('should throw an error when cart does not have billing address id', async () => {
    expect.assertions(1);

    const cart = cartTestFactory.create({ billingAddressId: undefined });

    try {
      cartValidatorServiceImpl.validate({ cart, orderCreatorId: cart.customerId });
    } catch (error) {
      expect(error).toBeInstanceOf(BillingAddressNotProvidedError);
    }
  });

  it('should throw an error when cart does not have shipping address id', async () => {
    expect.assertions(1);

    const cart = cartTestFactory.create({ shippingAddressId: undefined });

    try {
      cartValidatorServiceImpl.validate({ cart, orderCreatorId: cart.customerId });
    } catch (error) {
      expect(error).toBeInstanceOf(ShippingAddressNotProvidedError);
    }
  });

  it('should throw an error when cart does not have line items', async () => {
    expect.assertions(1);

    const cart = cartTestFactory.create({ lineItems: [] });

    try {
      cartValidatorServiceImpl.validate({ cart, orderCreatorId: cart.customerId });
    } catch (error) {
      expect(error).toBeInstanceOf(LineItemsNotProvidedError);
    }
  });

  it('should throw an error when cart does not delivery method', async () => {
    expect.assertions(1);

    const cart = cartTestFactory.create({ deliveryMethod: undefined });

    try {
      cartValidatorServiceImpl.validate({ cart, orderCreatorId: cart.customerId });
    } catch (error) {
      expect(error).toBeInstanceOf(DeliveryMethodNotProvidedError);
    }
  });

  it('should throw an error when total price of the cart does not match sum of the line items prices', async () => {
    expect.assertions(1);

    const cart = cartTestFactory.create({ lineItems: [lineItemTestFactory.create({ price: 400 })], totalPrice: 200 });

    try {
      cartValidatorServiceImpl.validate({ cart, orderCreatorId: cart.customerId });
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidTotalPriceError);
    }
  });
});
