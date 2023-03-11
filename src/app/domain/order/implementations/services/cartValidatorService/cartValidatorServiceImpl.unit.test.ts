import 'reflect-metadata';
import { CartValidatorServiceImpl } from './cartValidatorServiceImpl';
import { DummyFactory } from '../../../../../../common/tests/implementations/dummyFactory';
import { LoggerService } from '../../../../../../libs/logger/contracts/services/loggerService/loggerService';
import { UnitOfWork } from '../../../../../../libs/unitOfWork/contracts/unitOfWork';
import { CartStatus } from '../../../../cart/contracts/cartStatus';
import { CartTestFactory } from '../../../../cart/tests/factories/cartTestFactory/cartTestFactory';
import { InventoryService } from '../../../../inventory/contracts/services/inventoryService/inventoryService';
import { InventoryTestFactory } from '../../../../inventory/tests/factories/inventoryTestFactory/inventoryTestFactory';
import { LineItemTestFactory } from '../../../../lineItem/tests/factories/lineItemTestFactory/lineItemTestFactory';
import { BillingAddressNotProvidedError } from '../../../errors/billingAddressNotProvidedError';
import { CartNotActiveError } from '../../../errors/cartNotActiveError';
import { DeliveryMethodNotProvidedError } from '../../../errors/deliveryMethodNotProvidedError';
import { InvalidTotalPriceError } from '../../../errors/invalidTotalPriceError';
import { LineItemOutOfInventoryError } from '../../../errors/lineItemOutOfInventoryError';
import { LineItemsNotProvidedError } from '../../../errors/lineItemsNotProvidedError';
import { OrderCreatorNotMatchingCustomerIdFromCart } from '../../../errors/orderCreatorNotMatchingCustomerIdFromCart';
import { ShippingAddressNotProvidedError } from '../../../errors/shippingAddressNotProvidedError';

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
