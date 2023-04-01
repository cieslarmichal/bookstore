import 'reflect-metadata';

import { CartValidatorServiceImpl } from './cartValidatorServiceImpl';
import { DummyFactory } from '../../../../../common/tests/dummyFactory';
import { LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService';
import { UnitOfWork } from '../../../../../libs/unitOfWork/unitOfWork';
import { InventoryService } from '../../../../inventoryModule/application/services/inventoryService/inventoryService';
import { InventoryTestFactory } from '../../../../inventoryModule/tests/factories/inventoryTestFactory/inventoryTestFactory';
import { CartStatus } from '../../../domain/entities/cart/cartStatus';
import { BillingAddressNotProvidedError } from '../../../domain/errors/billingAddressNotProvidedError';
import { CartNotActiveError } from '../../../domain/errors/cartNotActiveError';
import { DeliveryMethodNotProvidedError } from '../../../domain/errors/deliveryMethodNotProvidedError';
import { InvalidTotalPriceError } from '../../../domain/errors/invalidTotalPriceError';
import { LineItemOutOfInventoryError } from '../../../domain/errors/lineItemOutOfInventoryError';
import { LineItemsNotProvidedError } from '../../../domain/errors/lineItemsNotProvidedError';
import { OrderCreatorNotMatchingCustomerIdFromCart } from '../../../domain/errors/orderCreatorNotMatchingCustomerIdFromCart';
import { ShippingAddressNotProvidedError } from '../../../domain/errors/shippingAddressNotProvidedError';
import { CartTestFactory } from '../../../tests/factories/cartTestFactory/cartTestFactory';
import { LineItemTestFactory } from '../../../tests/factories/lineItemTestFactory/lineItemTestFactory';

describe('CartValidatorServiceImpl', () => {
  let inventoryService: InventoryService;
  let loggerService: LoggerService;
  let unitOfWork: UnitOfWork;
  let cartValidatorServiceImpl: CartValidatorServiceImpl;

  const inventoryTestFactory = new InventoryTestFactory();
  const lineItemTestFactory = new LineItemTestFactory();
  const cartTestFactory = new CartTestFactory(lineItemTestFactory);

  beforeAll(async () => {
    inventoryService = new DummyFactory().create();
    loggerService = new DummyFactory().create();
    unitOfWork = new DummyFactory().create();
    cartValidatorServiceImpl = new CartValidatorServiceImpl(inventoryService, loggerService);
  });

  it('should throw an error when order creator id does not match customer id from cart', async () => {
    expect.assertions(1);

    const cart = cartTestFactory.create();

    const { customerId: orderCreatorId } = cartTestFactory.create();

    try {
      await cartValidatorServiceImpl.validate({ unitOfWork, cart, orderCreatorId });
    } catch (error) {
      expect(error).toBeInstanceOf(OrderCreatorNotMatchingCustomerIdFromCart);
    }
  });

  it('should throw an error when cart is not active', async () => {
    expect.assertions(1);

    const cart = cartTestFactory.create({ status: CartStatus.inactive });

    try {
      await cartValidatorServiceImpl.validate({ unitOfWork, cart, orderCreatorId: cart.customerId });
    } catch (error) {
      expect(error).toBeInstanceOf(CartNotActiveError);
    }
  });

  it('should throw an error when cart does not have billing address id', async () => {
    expect.assertions(1);

    const cart = cartTestFactory.create({ billingAddressId: undefined });

    try {
      await cartValidatorServiceImpl.validate({ unitOfWork, cart, orderCreatorId: cart.customerId });
    } catch (error) {
      expect(error).toBeInstanceOf(BillingAddressNotProvidedError);
    }
  });

  it('should throw an error when cart does not have shipping address id', async () => {
    expect.assertions(1);

    const cart = cartTestFactory.create({ shippingAddressId: undefined });

    try {
      await cartValidatorServiceImpl.validate({ unitOfWork, cart, orderCreatorId: cart.customerId });
    } catch (error) {
      expect(error).toBeInstanceOf(ShippingAddressNotProvidedError);
    }
  });

  it('should throw an error when cart does not have line items', async () => {
    expect.assertions(1);

    const cart = cartTestFactory.create({ lineItems: [] });

    try {
      await cartValidatorServiceImpl.validate({ unitOfWork, cart, orderCreatorId: cart.customerId });
    } catch (error) {
      expect(error).toBeInstanceOf(LineItemsNotProvidedError);
    }
  });

  it('should throw an error when cart does not delivery method', async () => {
    expect.assertions(1);

    const cart = cartTestFactory.create({ deliveryMethod: undefined });

    try {
      await cartValidatorServiceImpl.validate({ unitOfWork, cart, orderCreatorId: cart.customerId });
    } catch (error) {
      expect(error).toBeInstanceOf(DeliveryMethodNotProvidedError);
    }
  });

  it('should throw an error when total price of the cart does not match sum of the line items prices', async () => {
    expect.assertions(1);

    const cart = cartTestFactory.create({ lineItems: [lineItemTestFactory.create({ price: 400 })], totalPrice: 200 });

    try {
      await cartValidatorServiceImpl.validate({ unitOfWork, cart, orderCreatorId: cart.customerId });
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidTotalPriceError);
    }
  });

  it('should throw an error when line item is out of inventory', async () => {
    expect.assertions(1);

    const cart = cartTestFactory.create({
      lineItems: [lineItemTestFactory.create({ price: 100, quantity: 4 })],
      totalPrice: 400,
    });

    const inventory = inventoryTestFactory.create({ quantity: 3 });

    jest.spyOn(inventoryService, 'findInventory').mockImplementation(async () => {
      return inventory;
    });

    try {
      await cartValidatorServiceImpl.validate({ unitOfWork, cart, orderCreatorId: cart.customerId });
    } catch (error) {
      expect(error).toBeInstanceOf(LineItemOutOfInventoryError);
    }
  });

  it('should not throw any error', async () => {
    expect.assertions(1);

    const cart = cartTestFactory.create({
      lineItems: [lineItemTestFactory.create({ price: 100, quantity: 4 })],
      totalPrice: 400,
    });

    const inventory = inventoryTestFactory.create({ quantity: 6 });

    jest.spyOn(inventoryService, 'findInventory').mockImplementation(async () => {
      return inventory;
    });

    expect(async () => {
      await cartValidatorServiceImpl.validate({ unitOfWork, cart, orderCreatorId: cart.customerId });
    }).not.toThrow();
  });
});
