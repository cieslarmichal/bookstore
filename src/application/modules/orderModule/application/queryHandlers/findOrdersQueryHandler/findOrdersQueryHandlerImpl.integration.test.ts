import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { FindOrdersQueryHandler } from './findOrdersQueryHandler';
import { TestTransactionInternalRunner } from '../../../../../../common/tests/testTransactionInternalRunner';
import { postgresModuleSymbols } from '../../../../../../libs/postgres/postgresModuleSymbols';
import { Application } from '../../../../../application';
import { BookRepositoryFactory } from '../../../../bookModule/application/repositories/bookRepository/bookRepositoryFactory';
import { bookSymbols } from '../../../../bookModule/symbols';
import { BookEntityTestFactory } from '../../../../bookModule/tests/factories/bookEntityTestFactory/bookEntityTestFactory';
import { CustomerRepositoryFactory } from '../../../../customerModule/application/repositories/customerRepository/customerRepositoryFactory';
import { customerSymbols } from '../../../../customerModule/symbols';
import { CustomerEntityTestFactory } from '../../../../customerModule/tests/factories/customerEntityTestFactory/customerEntityTestFactory';
import { UserRepositoryFactory } from '../../../../userModule/application/repositories/userRepository/userRepositoryFactory';
import { UserEntityTestFactory } from '../../../../userModule/tests/factories/userEntityTestFactory/userEntityTestFactory';
import { userModuleSymbols } from '../../../../userModule/userModuleSymbols';
import { CartStatus } from '../../../domain/entities/cart/cartStatus';
import { DeliveryMethod } from '../../../domain/entities/cart/deliveryMethod';
import { symbols } from '../../../symbols';
import { CartEntityTestFactory } from '../../../tests/factories/cartEntityTestFactory/cartEntityTestFactory';
import { LineItemEntityTestFactory } from '../../../tests/factories/lineItemEntityTestFactory/lineItemEntityTestFactory';
import { OrderEntityTestFactory } from '../../../tests/factories/orderEntityTestFactory/orderEntityTestFactory';
import { CartRepositoryFactory } from '../../repositories/cartRepository/cartRepositoryFactory';
import { LineItemRepositoryFactory } from '../../repositories/lineItemRepository/lineItemRepositoryFactory';
import { OrderRepositoryFactory } from '../../repositories/orderRepository/orderRepositoryFactory';

describe('FindOrdersQueryHandler', () => {
  let findOrdersQueryHandler: FindOrdersQueryHandler;
  let cartRepositoryFactory: CartRepositoryFactory;
  let userRepositoryFactory: UserRepositoryFactory;
  let customerRepositoryFactory: CustomerRepositoryFactory;
  let bookRepositoryFactory: BookRepositoryFactory;
  let lineItemRepositoryFactory: LineItemRepositoryFactory;
  let orderRepositoryFactory: OrderRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

  const orderEntityTestFactory = new OrderEntityTestFactory();
  const cartEntityTestFactory = new CartEntityTestFactory();
  const userEntityTestFactory = new UserEntityTestFactory();
  const customerEntityTestFactory = new CustomerEntityTestFactory();
  const bookEntityTestFactory = new BookEntityTestFactory();
  const lineItemEntityTestFactory = new LineItemEntityTestFactory();

  beforeAll(async () => {
    const container = Application.createContainer();

    findOrdersQueryHandler = container.get<FindOrdersQueryHandler>(symbols.findOrdersQueryHandler);
    orderRepositoryFactory = container.get<OrderRepositoryFactory>(symbols.orderRepositoryFactory);
    cartRepositoryFactory = container.get<CartRepositoryFactory>(symbols.cartRepositoryFactory);
    customerRepositoryFactory = container.get<CustomerRepositoryFactory>(customerSymbols.customerRepositoryFactory);
    userRepositoryFactory = container.get<UserRepositoryFactory>(userModuleSymbols.userRepositoryFactory);
    bookRepositoryFactory = container.get<BookRepositoryFactory>(bookSymbols.bookRepositoryFactory);
    lineItemRepositoryFactory = container.get<LineItemRepositoryFactory>(symbols.lineItemRepositoryFactory);
    dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('finds orders by customer id in database', async () => {
    expect.assertions(2);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const entityManager = unitOfWork.getEntityManager();

      const userRepository = userRepositoryFactory.create(entityManager);

      const cartRepository = cartRepositoryFactory.create(entityManager);

      const bookRepository = bookRepositoryFactory.create(entityManager);

      const customerRepository = customerRepositoryFactory.create(entityManager);

      const lineItemRepository = lineItemRepositoryFactory.create(entityManager);

      const orderRepository = orderRepositoryFactory.create(entityManager);

      const { id: userId1, email: email1, password } = userEntityTestFactory.create();

      const { id: userId2, email: email2 } = userEntityTestFactory.create();

      const { id: customerId1 } = customerEntityTestFactory.create();

      const { id: customerId2 } = customerEntityTestFactory.create();

      const { id: cartId1, billingAddressId, shippingAddressId, deliveryMethod } = cartEntityTestFactory.create();

      const { id: cartId2 } = cartEntityTestFactory.create();

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
        id: lineItemId1,
        price,
        totalPrice,
        quantity,
      } = lineItemEntityTestFactory.create({ quantity: 2, price: bookPrice });

      const { id: lineItemId2 } = lineItemEntityTestFactory.create();

      const { id: orderId1, orderNumber: orderNumber1, paymentMethod, status } = orderEntityTestFactory.create();

      const { id: orderId2, orderNumber: orderNumber2 } = orderEntityTestFactory.create();

      const user1 = await userRepository.createOne({ id: userId1, email: email1 as string, password });

      const user2 = await userRepository.createOne({ id: userId2, email: email2 as string, password });

      const customer1 = await customerRepository.createCustomer({ id: customerId1, userId: user1.id });

      const customer2 = await customerRepository.createCustomer({ id: customerId2, userId: user2.id });

      const book = await bookRepository.createBook({
        id: bookId,
        price: bookPrice,
        format,
        isbn,
        language,
        releaseYear,
        title,
      });

      const cart1 = await cartRepository.createCart({
        id: cartId1,
        customerId: customer1.id,
        status: CartStatus.active,
        totalPrice,
        billingAddressId: billingAddressId as string,
        shippingAddressId: shippingAddressId as string,
        deliveryMethod: deliveryMethod as DeliveryMethod,
      });

      await lineItemRepository.createLineItem({
        id: lineItemId1,
        price,
        quantity,
        totalPrice,
        cartId: cart1.id,
        bookId: book.id,
      });

      const cart2 = await cartRepository.createCart({
        id: cartId2,
        customerId: customer2.id,
        status: CartStatus.active,
        totalPrice,
        billingAddressId: billingAddressId as string,
        shippingAddressId: shippingAddressId as string,
        deliveryMethod: deliveryMethod as DeliveryMethod,
      });

      await lineItemRepository.createLineItem({
        id: lineItemId2,
        price,
        quantity,
        totalPrice,
        cartId: cart2.id,
        bookId: book.id,
      });

      const order1 = await orderRepository.createOrder({
        id: orderId1,
        cartId: cart1.id,
        paymentMethod,
        customerId: customer1.id,
        orderNumber: orderNumber1,
        status,
      });

      await orderRepository.createOrder({
        id: orderId2,
        cartId: cart2.id,
        paymentMethod,
        customerId: customer2.id,
        orderNumber: orderNumber2,
        status,
      });

      const { orders: actualOrders } = await findOrdersQueryHandler.execute({
        unitOfWork,
        pagination: { limit: 20, page: 1 },
        customerId: customerId1,
      });

      expect(actualOrders.length).toEqual(1);
      expect(actualOrders[0]?.id).toEqual(order1.id);
    });
  });
});
