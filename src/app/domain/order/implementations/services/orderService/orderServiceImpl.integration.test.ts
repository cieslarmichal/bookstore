import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { TestTransactionInternalRunner } from '../../../../../integrations/common/tests/unitOfWork/testTransactionInternalRunner';
import { DependencyInjectionContainerFactory } from '../../../../../libs/dependencyInjection/implementations/factories/dependencyInjectionContainerFactory/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../../../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../../../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../../../../libs/postgres/postgresModule';
import { postgresSymbols } from '../../../../../libs/postgres/postgresSymbols';
import { PostgresModuleConfigTestFactory } from '../../../../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';
import { UnitOfWorkModule } from '../../../../../libs/unitOfWork/unitOfWorkModule';
import { AddressEntity } from '../../../../address/contracts/addressEntity';
import { AuthorEntity } from '../../../../author/contracts/authorEntity';
import { AuthorBookEntity } from '../../../../authorBook/contracts/authorBookEntity';
import { BookModule } from '../../../../book/bookModule';
import { bookSymbols } from '../../../../book/bookSymbols';
import { BookEntity } from '../../../../book/contracts/bookEntity';
import { BookRepositoryFactory } from '../../../../book/contracts/factories/bookRepositoryFactory/bookRepositoryFactory';
import { BookEntityTestFactory } from '../../../../book/tests/factories/bookEntityTestFactory/bookEntityTestFactory';
import { BookCategoryEntity } from '../../../../bookCategory/contracts/bookCategoryEntity';
import { CartModule } from '../../../../cart/cartModule';
import { cartSymbols } from '../../../../cart/cartSymbols';
import { CartEntity } from '../../../../cart/contracts/cartEntity';
import { CartStatus } from '../../../../cart/contracts/cartStatus';
import { DeliveryMethod } from '../../../../cart/contracts/deliveryMethod';
import { CartRepositoryFactory } from '../../../../cart/contracts/factories/cartRepositoryFactory/cartRepositoryFactory';
import { CartNotFoundError } from '../../../../cart/errors/cartNotFoundError';
import { CartEntityTestFactory } from '../../../../cart/tests/factories/cartEntityTestFactory/cartEntityTestFactory';
import { CategoryEntity } from '../../../../category/contracts/categoryEntity';
import { CustomerEntity } from '../../../../customer/contracts/customerEntity';
import { CustomerRepositoryFactory } from '../../../../customer/contracts/factories/customerRepositoryFactory/customerRepositoryFactory';
import { CustomerModule } from '../../../../customer/customerModule';
import { customerSymbols } from '../../../../customer/customerSymbols';
import { CustomerEntityTestFactory } from '../../../../customer/tests/factories/customerEntityTestFactory/customerEntityTestFactory';
import { LineItemRepositoryFactory } from '../../../../lineItem/contracts/factories/lineItemRepositoryFactory/lineItemRepositoryFactory';
import { LineItemEntity } from '../../../../lineItem/contracts/lineItemEntity';
import { LineItemModule } from '../../../../lineItem/lineItemModule';
import { lineItemSymbols } from '../../../../lineItem/lineItemSymbols';
import { LineItemEntityTestFactory } from '../../../../lineItem/tests/factories/lineItemEntityTestFactory/lineItemEntityTestFactory';
import { UserRepositoryFactory } from '../../../../user/contracts/factories/userRepositoryFactory/userRepositoryFactory';
import { UserEntity } from '../../../../user/contracts/userEntity';
import { UserEntityTestFactory } from '../../../../user/tests/factories/userEntityTestFactory/userEntityTestFactory';
import { UserModuleConfigTestFactory } from '../../../../user/tests/factories/userModuleConfigTestFactory/userModuleConfigTestFactory';
import { UserModule } from '../../../../user/userModule';
import { userSymbols } from '../../../../user/userSymbols';
import { OrderRepositoryFactory } from '../../../contracts/factories/orderRepositoryFactory/orderRepositoryFactory';
import { OrderEntity } from '../../../contracts/orderEntity';
import { PaymentMethod } from '../../../contracts/paymentMethod';
import { OrderService } from '../../../contracts/services/orderService/orderService';
import { OrderModule } from '../../../orderModule';
import { orderSymbols } from '../../../orderSymbols';
import { OrderEntityTestFactory } from '../../../tests/factories/orderEntityTestFactory/orderEntityTestFactory';

describe('OrderServiceImpl', () => {
  let orderService: OrderService;
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

  const loggerModuleConfig = new LoggerModuleConfigTestFactory().create();
  const postgresModuleConfig = new PostgresModuleConfigTestFactory().create({
    entities: [
      BookEntity,
      AuthorEntity,
      UserEntity,
      CategoryEntity,
      AuthorBookEntity,
      BookCategoryEntity,
      AddressEntity,
      OrderEntity,
      CartEntity,
      OrderEntity,
      CustomerEntity,
      LineItemEntity,
    ],
  });
  const userModuleConfig = new UserModuleConfigTestFactory().create();

  beforeAll(async () => {
    const container = await DependencyInjectionContainerFactory.create({
      modules: [
        new PostgresModule(postgresModuleConfig),
        new CartModule(),
        new LoggerModule(loggerModuleConfig),
        new UserModule(userModuleConfig),
        new CustomerModule(),
        new UnitOfWorkModule(),
        new LineItemModule(),
        new BookModule(),
        new OrderModule(),
      ],
    });

    orderService = container.get<OrderService>(orderSymbols.orderService);
    orderRepositoryFactory = container.get<OrderRepositoryFactory>(orderSymbols.orderRepositoryFactory);
    cartRepositoryFactory = container.get<CartRepositoryFactory>(cartSymbols.cartRepositoryFactory);
    customerRepositoryFactory = container.get<CustomerRepositoryFactory>(customerSymbols.customerRepositoryFactory);
    userRepositoryFactory = container.get<UserRepositoryFactory>(userSymbols.userRepositoryFactory);
    bookRepositoryFactory = container.get<BookRepositoryFactory>(bookSymbols.bookRepositoryFactory);
    lineItemRepositoryFactory = container.get<LineItemRepositoryFactory>(lineItemSymbols.lineItemRepositoryFactory);
    dataSource = container.get<DataSource>(postgresSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('Create order', () => {
    it('creates order in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const cartRepository = cartRepositoryFactory.create(entityManager);

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const lineItemRepository = lineItemRepositoryFactory.create(entityManager);

        const orderRepository = orderRepositoryFactory.create(entityManager);

        const { id: userId, email, password, role } = userEntityTestFactory.create();

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
          quantity,
        } = lineItemEntityTestFactory.create({ quantity: 2, price: bookPrice });

        const user = await userRepository.createOne({ id: userId, email: email as string, password, role });

        const customer = await customerRepository.createOne({ id: customerId, userId: user.id });

        const book = await bookRepository.createOne({
          id: bookId,
          price: bookPrice,
          format,
          isbn,
          language,
          releaseYear,
          title,
        });

        const cart = await cartRepository.createOne({
          id: cartId,
          customerId: customer.id,
          status: CartStatus.active,
          totalPrice,
          billingAddressId: billingAddressId as string,
          shippingAddressId: shippingAddressId as string,
          deliveryMethod: deliveryMethod as DeliveryMethod,
        });

        await lineItemRepository.createOne({
          id: lineItemId,
          price,
          quantity,
          totalPrice,
          cartId: cart.id,
          bookId: book.id,
        });

        const order = await orderService.createOrder({
          unitOfWork,
          draft: { cartId: cart.id, paymentMethod: PaymentMethod.bankTransfer },
        });

        const foundOrder = await orderRepository.findOne({ id: order.id });

        expect(foundOrder).not.toBeNull();
      });
    });

    it('throws if cart with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { id: cartId } = cartEntityTestFactory.create();

        try {
          await orderService.createOrder({ unitOfWork, draft: { cartId, paymentMethod: PaymentMethod.bankTransfer } });
        } catch (error) {
          expect(error).toBeInstanceOf(CartNotFoundError);
        }
      });
    });
  });

  describe('Find orders', () => {
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

        const { id: userId1, email: email1, password, role } = userEntityTestFactory.create();

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

        const user1 = await userRepository.createOne({ id: userId1, email: email1 as string, password, role });

        const user2 = await userRepository.createOne({ id: userId2, email: email2 as string, password, role });

        const customer1 = await customerRepository.createOne({ id: customerId1, userId: user1.id });

        const customer2 = await customerRepository.createOne({ id: customerId2, userId: user2.id });

        const book = await bookRepository.createOne({
          id: bookId,
          price: bookPrice,
          format,
          isbn,
          language,
          releaseYear,
          title,
        });

        const cart1 = await cartRepository.createOne({
          id: cartId1,
          customerId: customer1.id,
          status: CartStatus.active,
          totalPrice,
          billingAddressId: billingAddressId as string,
          shippingAddressId: shippingAddressId as string,
          deliveryMethod: deliveryMethod as DeliveryMethod,
        });

        await lineItemRepository.createOne({
          id: lineItemId1,
          price,
          quantity,
          totalPrice,
          cartId: cart1.id,
          bookId: book.id,
        });

        const cart2 = await cartRepository.createOne({
          id: cartId2,
          customerId: customer2.id,
          status: CartStatus.active,
          totalPrice,
          billingAddressId: billingAddressId as string,
          shippingAddressId: shippingAddressId as string,
          deliveryMethod: deliveryMethod as DeliveryMethod,
        });

        await lineItemRepository.createOne({
          id: lineItemId2,
          price,
          quantity,
          totalPrice,
          cartId: cart2.id,
          bookId: book.id,
        });

        const order1 = await orderRepository.createOne({
          id: orderId1,
          cartId: cart1.id,
          paymentMethod,
          customerId: customer1.id,
          orderNumber: orderNumber1,
          status,
        });

        await orderRepository.createOne({
          id: orderId2,
          cartId: cart2.id,
          paymentMethod,
          customerId: customer2.id,
          orderNumber: orderNumber2,
          status,
        });

        const actualOrders = await orderService.findOrders({
          unitOfWork,
          pagination: { limit: 20, page: 1 },
          customerId: customerId1,
        });

        expect(actualOrders.length).toEqual(1);
        expect(actualOrders[0]?.id).toEqual(order1.id);
      });
    });
  });
});
