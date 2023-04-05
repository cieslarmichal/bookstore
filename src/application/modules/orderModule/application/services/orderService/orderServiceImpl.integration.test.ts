import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { OrderService } from './orderService';
import { TestTransactionInternalRunner } from '../../../../../../common/tests/testTransactionInternalRunner';
import { DependencyInjectionContainerFactory } from '../../../../../../libs/dependencyInjection/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../../../../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../../../../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../../../../../libs/postgres/postgresModule';
import { postgresModuleSymbols } from '../../../../../../libs/postgres/postgresModuleSymbols';
import { PostgresModuleConfigTestFactory } from '../../../../../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';
import { UnitOfWorkModule } from '../../../../../../libs/unitOfWork/unitOfWorkModule';
import { AddressModule } from '../../../../addressModule/addressModule';
import { AddressEntity } from '../../../../addressModule/infrastructure/repositories/addressRepository/addressEntity/addressEntity';
import { AuthorBookEntity } from '../../../../authorBookModule/infrastructure/repositories/authorBookRepository/authorBookEntity/authorBookEntity';
import { AuthorEntity } from '../../../../authorModule/infrastructure/repositories/authorRepository/authorEntity/authorEntity';
import { BookCategoryEntity } from '../../../../bookCategoryModule/infrastructure/repositories/bookCategoryRepository/bookCategoryEntity/bookCategoryEntity';
import { BookRepositoryFactory } from '../../../../bookModule/application/repositories/bookRepository/bookRepositoryFactory';
import { BookModule } from '../../../../bookModule/bookModule';
import { bookModuleSymbols } from '../../../../bookModule/bookModuleSymbols';
import { BookEntity } from '../../../../bookModule/infrastructure/repositories/bookRepository/bookEntity/bookEntity';
import { BookEntityTestFactory } from '../../../../bookModule/tests/factories/bookEntityTestFactory/bookEntityTestFactory';
import { CategoryEntity } from '../../../../categoryModule/infrastructure/repositories/categoryRepository/categoryEntity/categoryEntity';
import { CustomerRepositoryFactory } from '../../../../customerModule/application/repositories/customerRepository/customerRepositoryFactory';
import { CustomerModule } from '../../../../customerModule/customerModule';
import { customerModuleSymbols } from '../../../../customerModule/customerModuleSymbols';
import { CustomerEntity } from '../../../../customerModule/infrastructure/repositories/customerRepository/customerEntity/customerEntity';
import { CustomerEntityTestFactory } from '../../../../customerModule/tests/factories/customerEntityTestFactory/customerEntityTestFactory';
import { InventoryRepositoryFactory } from '../../../../inventoryModule/application/repositories/inventoryRepository/inventoryRepositoryFactory';
import { InventoryEntity } from '../../../../inventoryModule/infrastructure/repositories/inventoryRepository/inventoryEntity/inventoryEntity';
import { InventoryModule } from '../../../../inventoryModule/inventoryModule';
import { inventoryModuleSymbols } from '../../../../inventoryModule/inventoryModuleSymbols';
import { InventoryEntityTestFactory } from '../../../../inventoryModule/tests/factories/inventoryEntityTestFactory/inventoryEntityTestFactory';
import { UserRepositoryFactory } from '../../../../userModule/application/repositories/userRepository/userRepositoryFactory';
import { UserEntity } from '../../../../userModule/infrastructure/repositories/userRepository/userEntity/userEntity';
import { UserEntityTestFactory } from '../../../../userModule/tests/factories/userEntityTestFactory/userEntityTestFactory';
import { UserModuleConfigTestFactory } from '../../../../userModule/tests/factories/userModuleConfigTestFactory/userModuleConfigTestFactory';
import { UserModule } from '../../../../userModule/userModule';
import { userModuleSymbols } from '../../../../userModule/userModuleSymbols';
import { CartStatus } from '../../../domain/entities/cart/cartStatus';
import { DeliveryMethod } from '../../../domain/entities/cart/deliveryMethod';
import { PaymentMethod } from '../../../domain/entities/order/paymentMethod';
import { CartNotFoundError } from '../../../infrastructure/errors/cartNotFoundError';
import { CartEntity } from '../../../infrastructure/repositories/cartRepository/cartEntity/cartEntity';
import { LineItemEntity } from '../../../infrastructure/repositories/lineItemRepository/lineItemEntity/lineItemEntity';
import { OrderEntity } from '../../../infrastructure/repositories/orderRepository/orderEntity/orderEntity';
import { OrderModule } from '../../../orderModule';
import { orderModuleSymbols } from '../../../orderModuleSymbols';
import { CartEntityTestFactory } from '../../../tests/factories/cartEntityTestFactory/cartEntityTestFactory';
import { LineItemEntityTestFactory } from '../../../tests/factories/lineItemEntityTestFactory/lineItemEntityTestFactory';
import { OrderEntityTestFactory } from '../../../tests/factories/orderEntityTestFactory/orderEntityTestFactory';
import { CartRepositoryFactory } from '../../repositories/cartRepository/cartRepositoryFactory';
import { LineItemRepositoryFactory } from '../../repositories/lineItemRepository/lineItemRepositoryFactory';
import { OrderRepositoryFactory } from '../../repositories/orderRepository/orderRepositoryFactory';

describe('OrderServiceImpl', () => {
  let orderService: OrderService;
  let cartRepositoryFactory: CartRepositoryFactory;
  let userRepositoryFactory: UserRepositoryFactory;
  let customerRepositoryFactory: CustomerRepositoryFactory;
  let bookRepositoryFactory: BookRepositoryFactory;
  let lineItemRepositoryFactory: LineItemRepositoryFactory;
  let orderRepositoryFactory: OrderRepositoryFactory;
  let inventoryRepositoryFactory: InventoryRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

  const orderEntityTestFactory = new OrderEntityTestFactory();
  const cartEntityTestFactory = new CartEntityTestFactory();
  const userEntityTestFactory = new UserEntityTestFactory();
  const customerEntityTestFactory = new CustomerEntityTestFactory();
  const bookEntityTestFactory = new BookEntityTestFactory();
  const lineItemEntityTestFactory = new LineItemEntityTestFactory();
  const inventoryEntityTestFactory = new InventoryEntityTestFactory();

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
      InventoryEntity,
    ],
  });
  const userModuleConfig = new UserModuleConfigTestFactory().create();

  beforeAll(async () => {
    const container = await DependencyInjectionContainerFactory.create({
      modules: [
        new PostgresModule(postgresModuleConfig),
        new LoggerModule(loggerModuleConfig),
        new UserModule(userModuleConfig),
        new CustomerModule(),
        new UnitOfWorkModule(),
        new BookModule(),
        new OrderModule(),
        new AddressModule(),
        new InventoryModule(),
      ],
    });

    orderService = container.get<OrderService>(orderModuleSymbols.orderService);
    orderRepositoryFactory = container.get<OrderRepositoryFactory>(orderModuleSymbols.orderRepositoryFactory);
    cartRepositoryFactory = container.get<CartRepositoryFactory>(orderModuleSymbols.cartRepositoryFactory);
    customerRepositoryFactory = container.get<CustomerRepositoryFactory>(
      customerModuleSymbols.customerRepositoryFactory,
    );
    userRepositoryFactory = container.get<UserRepositoryFactory>(userModuleSymbols.userRepositoryFactory);
    bookRepositoryFactory = container.get<BookRepositoryFactory>(bookModuleSymbols.bookRepositoryFactory);
    lineItemRepositoryFactory = container.get<LineItemRepositoryFactory>(orderModuleSymbols.lineItemRepositoryFactory);
    inventoryRepositoryFactory = container.get<InventoryRepositoryFactory>(
      inventoryModuleSymbols.inventoryRepositoryFactory,
    );
    dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('Create order', () => {
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

        await inventoryRepository.createOne({
          id: inventoryId,
          quantity: inventoryQuantity,
          bookId,
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
          quantity: lineItemQuantity,
          totalPrice,
          cartId: cart.id,
          bookId: book.id,
        });

        const order = await orderService.createOrder({
          unitOfWork,
          draft: { cartId: cart.id, paymentMethod: PaymentMethod.bankTransfer, orderCreatorId: customer.id },
        });

        const foundOrder = await orderRepository.findOne({ id: order.id });

        const foundCart = await cartRepository.findOne({ id: cartId });

        expect(foundOrder).not.toBeNull();
        expect(foundCart?.status).toEqual(CartStatus.inactive);
      });
    });

    it('throws if cart with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { id: cartId, customerId } = cartEntityTestFactory.create();

        try {
          await orderService.createOrder({
            unitOfWork,
            draft: { cartId, paymentMethod: PaymentMethod.bankTransfer, orderCreatorId: customerId },
          });
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
