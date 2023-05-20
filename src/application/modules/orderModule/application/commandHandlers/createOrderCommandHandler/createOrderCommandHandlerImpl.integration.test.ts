import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { CreateOrderCommandHandler } from './createOrderCommandHandler';
import { TestTransactionInternalRunner } from '../../../../../../common/tests/testTransactionInternalRunner';
import { postgresModuleSymbols } from '../../../../../../libs/postgres/postgresModuleSymbols';
import { Application } from '../../../../../application';
import { BookRepositoryFactory } from '../../../../bookModule/application/repositories/bookRepository/bookRepositoryFactory';
import { bookSymbols } from '../../../../bookModule/symbols';
import { BookEntityTestFactory } from '../../../../bookModule/tests/factories/bookEntityTestFactory/bookEntityTestFactory';
import { CustomerRepositoryFactory } from '../../../../customerModule/application/repositories/customerRepository/customerRepositoryFactory';
import { customerSymbols } from '../../../../customerModule/symbols';
import { CustomerEntityTestFactory } from '../../../../customerModule/tests/factories/customerEntityTestFactory/customerEntityTestFactory';
import { InventoryRepositoryFactory } from '../../../../inventoryModule/application/repositories/inventoryRepository/inventoryRepositoryFactory';
import { inventorySymbols } from '../../../../inventoryModule/symbols';
import { InventoryEntityTestFactory } from '../../../../inventoryModule/tests/factories/inventoryEntityTestFactory/inventoryEntityTestFactory';
import { UserRepositoryFactory } from '../../../../userModule/application/repositories/userRepository/userRepositoryFactory';
import { UserEntityTestFactory } from '../../../../userModule/tests/factories/userEntityTestFactory/userEntityTestFactory';
import { userModuleSymbols } from '../../../../userModule/userModuleSymbols';
import { CartStatus } from '../../../domain/entities/cart/cartStatus';
import { DeliveryMethod } from '../../../domain/entities/cart/deliveryMethod';
import { PaymentMethod } from '../../../domain/entities/order/paymentMethod';
import { CartNotFoundError } from '../../../infrastructure/errors/cartNotFoundError';
import { symbols } from '../../../symbols';
import { CartEntityTestFactory } from '../../../tests/factories/cartEntityTestFactory/cartEntityTestFactory';
import { LineItemEntityTestFactory } from '../../../tests/factories/lineItemEntityTestFactory/lineItemEntityTestFactory';
import { CartRepositoryFactory } from '../../repositories/cartRepository/cartRepositoryFactory';
import { LineItemRepositoryFactory } from '../../repositories/lineItemRepository/lineItemRepositoryFactory';
import { OrderRepositoryFactory } from '../../repositories/orderRepository/orderRepositoryFactory';

describe('CreateOrderCommandHandler', () => {
  let createOrderCommandHandler: CreateOrderCommandHandler;
  let cartRepositoryFactory: CartRepositoryFactory;
  let userRepositoryFactory: UserRepositoryFactory;
  let customerRepositoryFactory: CustomerRepositoryFactory;
  let bookRepositoryFactory: BookRepositoryFactory;
  let lineItemRepositoryFactory: LineItemRepositoryFactory;
  let orderRepositoryFactory: OrderRepositoryFactory;
  let inventoryRepositoryFactory: InventoryRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

  const cartEntityTestFactory = new CartEntityTestFactory();
  const userEntityTestFactory = new UserEntityTestFactory();
  const customerEntityTestFactory = new CustomerEntityTestFactory();
  const bookEntityTestFactory = new BookEntityTestFactory();
  const lineItemEntityTestFactory = new LineItemEntityTestFactory();
  const inventoryEntityTestFactory = new InventoryEntityTestFactory();

  beforeAll(async () => {
    const container = Application.createContainer();

    createOrderCommandHandler = container.get<CreateOrderCommandHandler>(symbols.createOrderCommandHandler);
    orderRepositoryFactory = container.get<OrderRepositoryFactory>(symbols.orderRepositoryFactory);
    cartRepositoryFactory = container.get<CartRepositoryFactory>(symbols.cartRepositoryFactory);
    customerRepositoryFactory = container.get<CustomerRepositoryFactory>(customerSymbols.customerRepositoryFactory);
    userRepositoryFactory = container.get<UserRepositoryFactory>(userModuleSymbols.userRepositoryFactory);
    bookRepositoryFactory = container.get<BookRepositoryFactory>(bookSymbols.bookRepositoryFactory);
    lineItemRepositoryFactory = container.get<LineItemRepositoryFactory>(symbols.lineItemRepositoryFactory);
    inventoryRepositoryFactory = container.get<InventoryRepositoryFactory>(inventorySymbols.inventoryRepositoryFactory);
    dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('creates order in database', async () => {
    expect.assertions(2);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const entityManager = unitOfWork.getEntityManager();

      const userRepository = userRepositoryFactory.create(entityManager);

      const cartRepository = cartRepositoryFactory.create(entityManager);

      const bookRepository = bookRepositoryFactory.create(entityManager);

      const customerRepository = customerRepositoryFactory.create(entityManager);

      const lineItemRepository = lineItemRepositoryFactory.create(entityManager);

      const orderRepository = orderRepositoryFactory.create(entityManager);

      const inventoryRepository = inventoryRepositoryFactory.create(entityManager);

      const { id: userId, email, password } = userEntityTestFactory.create();

      const { id: customerId } = customerEntityTestFactory.create();

      const { id: cartId, billingAddressId, shippingAddressId, deliveryMethod } = cartEntityTestFactory.create();

      const {
        id: bookId,
        price: bookPrice,
        format,
        isbn,
        language,
        releaseYear,
        title,
      } = bookEntityTestFactory.create();

      const {
        id: lineItemId,
        price,
        totalPrice,
        quantity: lineItemQuantity,
      } = lineItemEntityTestFactory.create({ quantity: 2, price: bookPrice });

      const { id: inventoryId, quantity: inventoryQuantity } = inventoryEntityTestFactory.create({ quantity: 10 });

      const user = await userRepository.createOne({ id: userId, email: email as string, password });

      const customer = await customerRepository.createCustomer({ id: customerId, userId: user.id });

      const book = await bookRepository.createBook({
        id: bookId,
        price: bookPrice,
        format,
        isbn,
        language,
        releaseYear,
        title,
      });

      await inventoryRepository.createInventory({
        id: inventoryId,
        quantity: inventoryQuantity,
        bookId,
      });

      const cart = await cartRepository.createCart({
        id: cartId,
        customerId: customer.id,
        status: CartStatus.active,
        totalPrice,
        billingAddressId: billingAddressId as string,
        shippingAddressId: shippingAddressId as string,
        deliveryMethod: deliveryMethod as DeliveryMethod,
      });

      await lineItemRepository.createLineItem({
        id: lineItemId,
        price,
        quantity: lineItemQuantity,
        totalPrice,
        cartId: cart.id,
        bookId: book.id,
      });

      const { order } = await createOrderCommandHandler.execute({
        unitOfWork,
        draft: { cartId: cart.id, paymentMethod: PaymentMethod.bankTransfer, orderCreatorId: customer.id },
      });

      const foundOrder = await orderRepository.findOrder({ id: order.id });

      const foundCart = await cartRepository.findCart({ id: cartId });

      expect(foundOrder).not.toBeNull();
      expect(foundCart?.status).toEqual(CartStatus.inactive);
    });
  });

  it('throws if cart with given id does not exist', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const { id: cartId, customerId } = cartEntityTestFactory.create();

      try {
        await createOrderCommandHandler.execute({
          unitOfWork,
          draft: { cartId, paymentMethod: PaymentMethod.bankTransfer, orderCreatorId: customerId },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(CartNotFoundError);
      }
    });
  });
});
