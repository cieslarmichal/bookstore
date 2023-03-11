import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { DependencyInjectionContainerFactory } from '../../../../../../libs/dependencyInjection/implementations/factories/dependencyInjectionContainerFactory/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../../../../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../../../../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../../../../../libs/postgres/postgresModule';
import { postgresSymbols } from '../../../../../../libs/postgres/postgresSymbols';
import { PostgresModuleConfigTestFactory } from '../../../../../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';
import { UnitOfWorkModule } from '../../../../../../libs/unitOfWork/unitOfWorkModule';
import { TestTransactionInternalRunner } from '../../../../../integrations/common/tests/unitOfWork/testTransactionInternalRunner';
import { AddressModule } from '../../../../address/addressModule';
import { AddressEntity } from '../../../../address/contracts/addressEntity';
import { AuthorEntity } from '../../../../author/contracts/authorEntity';
import { AuthorBookEntity } from '../../../../authorBook/contracts/authorBookEntity';
import { BookModule } from '../../../../book/bookModule';
import { bookSymbols } from '../../../../book/bookSymbols';
import { BookEntity } from '../../../../book/contracts/bookEntity';
import { BookRepositoryFactory } from '../../../../book/contracts/factories/bookRepositoryFactory/bookRepositoryFactory';
import { BookEntityTestFactory } from '../../../../book/tests/factories/bookEntityTestFactory/bookEntityTestFactory';
import { BookCategoryEntity } from '../../../../bookCategory/contracts/bookCategoryEntity';
import { CategoryEntity } from '../../../../categoryModule/infrastructure/repositories/categoryRepository/categoryEntity/categoryEntity';
import { CustomerRepositoryFactory } from '../../../../customerModule/application/repositories/customerRepository/customerRepositoryFactory';
import { CustomerEntity } from '../../../../customerModule/contracts/customerEntity';
import { CustomerModule } from '../../../../customerModule/customerModule';
import { customerModuleSymbols } from '../../../../customerModule/customerModuleSymbols';
import { CustomerEntityTestFactory } from '../../../../customerModule/tests/factories/customerEntityTestFactory/customerEntityTestFactory';
import { InventoryRepositoryFactory } from '../../../../inventoryModule/application/repositories/inventoryRepository/inventoryRepositoryFactory';
import { InventoryEntity } from '../../../../inventoryModule/infrastructure/repositories/inventoryRepository/inventoryEntity/inventoryEntity';
import { InventoryModule } from '../../../../inventoryModule/inventoryModule';
import { inventoryModuleSymbols } from '../../../../inventoryModule/inventoryModuleSymbols';
import { InventoryEntityTestFactory } from '../../../../inventoryModule/tests/factories/inventoryEntityTestFactory/inventoryEntityTestFactory';
import { LineItemRepositoryFactory } from '../../../../lineItemModule/application/repositories/lineItemRepository/lineItemRepositoryFactory';
import { LineItem } from '../../../../lineItemModule/domain/entities/lineItem/lineItem';
import { LineItemNotFoundError } from '../../../../lineItemModule/infrastructure/errors/lineItemNotFoundError';
import { LineItemEntity } from '../../../../lineItemModule/infrastructure/repositories/lineItemRepository/lineItemEntity/lineItemEntity';
import { LineItemModule } from '../../../../lineItemModule/lineItemModule';
import { lineItemModuleSymbols } from '../../../../lineItemModule/lineItemModuleSymbols';
import { LineItemEntityTestFactory } from '../../../../lineItemModule/tests/factories/lineItemEntityTestFactory/lineItemEntityTestFactory';
import { OrderEntity } from '../../../../order/contracts/orderEntity';
import { ReviewEntity } from '../../../../review/contracts/reviewEntity';
import { UserRepositoryFactory } from '../../../../user/contracts/factories/userRepositoryFactory/userRepositoryFactory';
import { UserEntity } from '../../../../user/contracts/userEntity';
import { UserEntityTestFactory } from '../../../../user/tests/factories/userEntityTestFactory/userEntityTestFactory';
import { UserModuleConfigTestFactory } from '../../../../user/tests/factories/userModuleConfigTestFactory/userModuleConfigTestFactory';
import { UserModule } from '../../../../user/userModule';
import { userSymbols } from '../../../../user/userSymbols';
import { CartModule } from '../../../cartModule';
import { cartSymbols } from '../../../cartSymbols';
import { CartEntity } from '../../../contracts/cartEntity';
import { CartStatus } from '../../../contracts/cartStatus';
import { DeliveryMethod } from '../../../contracts/deliveryMethod';
import { CartRepositoryFactory } from '../../../contracts/factories/cartRepositoryFactory/cartRepositoryFactory';
import { CartService } from '../../../contracts/services/cartService/cartService';
import { CartNotFoundError } from '../../../errors/cartNotFoundError';
import { CartEntityTestFactory } from '../../../tests/factories/cartEntityTestFactory/cartEntityTestFactory';

describe('CartServiceImpl', () => {
  let cartService: CartService;
  let cartRepositoryFactory: CartRepositoryFactory;
  let userRepositoryFactory: UserRepositoryFactory;
  let customerRepositoryFactory: CustomerRepositoryFactory;
  let bookRepositoryFactory: BookRepositoryFactory;
  let inventoryRepositoryFactory: InventoryRepositoryFactory;
  let lineItemRepositoryFactory: LineItemRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

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
      CustomerEntity,
      CartEntity,
      LineItemEntity,
      OrderEntity,
      InventoryEntity,
      ReviewEntity,
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
        new AddressModule(),
        new InventoryModule(),
      ],
    });

    cartService = container.get<CartService>(cartSymbols.cartService);
    cartRepositoryFactory = container.get<CartRepositoryFactory>(cartSymbols.cartRepositoryFactory);
    customerRepositoryFactory = container.get<CustomerRepositoryFactory>(
      customerModuleSymbols.customerRepositoryFactory,
    );
    userRepositoryFactory = container.get<UserRepositoryFactory>(userSymbols.userRepositoryFactory);
    bookRepositoryFactory = container.get<BookRepositoryFactory>(bookSymbols.bookRepositoryFactory);
    inventoryRepositoryFactory = container.get<InventoryRepositoryFactory>(
      inventoryModuleSymbols.inventoryRepositoryFactory,
    );
    lineItemRepositoryFactory = container.get<LineItemRepositoryFactory>(
      lineItemModuleSymbols.lineItemRepositoryFactory,
    );
    dataSource = container.get<DataSource>(postgresSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('Create cart', () => {
    it('creates cart in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const cartRepository = cartRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const { id: userId, email, password, role } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const user = await userRepository.createOne({ id: userId, email: email as string, password, role });

        const customer = await customerRepository.createOne({ id: customerId, userId: user.id });

        const cart = await cartService.createCart({ unitOfWork, draft: { customerId: customer.id } });

        const foundCart = await cartRepository.findOne({ id: cart.id });

        expect(foundCart).not.toBeNull();
      });
    });
  });

  describe('Find cart', () => {
    it('finds cart by id in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const cartRepository = cartRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const { id: userId, email, password, role } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const { id: cartId, status, totalPrice } = cartEntityTestFactory.create();

        const user = await userRepository.createOne({ id: userId, email: email as string, password, role });

        const customer = await customerRepository.createOne({ id: customerId, userId: user.id });

        const cart = await cartRepository.createOne({
          id: cartId,
          customerId: customer.id,
          status,
          totalPrice,
        });

        const foundCart = await cartService.findCart({ unitOfWork, cartId: cart.id });

        expect(foundCart).not.toBeNull();
      });
    });

    it('should throw if cart with given id does not exist in db', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { id } = cartEntityTestFactory.create();

        try {
          await cartService.findCart({ unitOfWork, cartId: id });
        } catch (error) {
          expect(error).toBeInstanceOf(CartNotFoundError);
        }
      });
    });
  });

  describe('Update cart', () => {
    it('updates cart in database', async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const cartRepository = cartRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const { id: userId, email, password, role } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const { id: cartId, totalPrice } = cartEntityTestFactory.create();

        const user = await userRepository.createOne({ id: userId, email: email as string, password, role });

        const customer = await customerRepository.createOne({ id: customerId, userId: user.id });

        const cart = await cartRepository.createOne({
          id: cartId,
          customerId: customer.id,
          status: CartStatus.active,
          totalPrice,
        });

        const updatedCart = await cartService.updateCart({
          unitOfWork,
          cartId: cart.id,
          draft: { status: CartStatus.inactive },
        });

        expect(updatedCart.id).toEqual(cartId);
        expect(updatedCart.status).toEqual(CartStatus.inactive);
      });
    });

    it('should throw if cart with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { id, deliveryMethod } = cartEntityTestFactory.create();

        try {
          await cartService.updateCart({
            unitOfWork,
            cartId: id,
            draft: { deliveryMethod: deliveryMethod as DeliveryMethod },
          });
        } catch (error) {
          expect(error).toBeInstanceOf(CartNotFoundError);
        }
      });
    });
  });

  describe('Add line item', () => {
    it('adds line item to a cart', async () => {
      expect.assertions(7);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const cartRepository = cartRepositoryFactory.create(entityManager);

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const inventoryRepository = inventoryRepositoryFactory.create(entityManager);

        const { id: userId, email, password, role } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const { id: cartId } = cartEntityTestFactory.create();

        const { id: inventoryId, quantity } = inventoryEntityTestFactory.create({ quantity: 10 });

        const {
          id: bookId,
          price: bookPrice,
          format,
          isbn,
          language,
          releaseYear,
          title,
        } = bookEntityTestFactory.create();

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

        await inventoryRepository.createOne({
          id: inventoryId,
          quantity,
          bookId,
        });

        const cart = await cartRepository.createOne({
          id: cartId,
          customerId: customer.id,
          status: CartStatus.active,
          totalPrice: 0,
        });

        const updatedCart = await cartService.addLineItem({
          unitOfWork,
          cartId: cart.id,
          draft: { bookId: book.id, quantity: 2 },
        });

        const lineItems = updatedCart.lineItems as LineItem[];

        expect(updatedCart.totalPrice).toEqual(2 * bookPrice);
        expect(lineItems.length).toEqual(1);
        expect(lineItems[0]?.bookId).toEqual(bookId);
        expect(lineItems[0]?.cartId).toEqual(cartId);
        expect(lineItems[0]?.price).toEqual(bookPrice);
        expect(lineItems[0]?.totalPrice).toEqual(2 * bookPrice);
        expect(lineItems[0]?.quantity).toEqual(2);
      });
    });

    it('should throw if cart with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { id: cartId } = cartEntityTestFactory.create();

        const { id: bookId } = bookEntityTestFactory.create();

        try {
          await cartService.addLineItem({
            unitOfWork,
            cartId,
            draft: { bookId, quantity: 1 },
          });
        } catch (error) {
          expect(error).toBeInstanceOf(CartNotFoundError);
        }
      });
    });
  });

  describe('Remove line item', () => {
    it('should descrease line item quantity if quantity to remove is less than total line item quantity', async () => {
      expect.assertions(7);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const cartRepository = cartRepositoryFactory.create(entityManager);

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const lineItemRepository = lineItemRepositoryFactory.create(entityManager);

        const { id: userId, email, password, role } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const { id: cartId } = cartEntityTestFactory.create();

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
        });

        const lineItem = await lineItemRepository.createOne({
          id: lineItemId,
          price,
          quantity,
          totalPrice,
          cartId: cart.id,
          bookId: book.id,
        });

        const updatedCart = await cartService.removeLineItem({
          unitOfWork,
          cartId: cart.id,
          draft: { lineItemId: lineItem.id, quantity: 1 },
        });

        const lineItems = updatedCart.lineItems as LineItem[];

        expect(updatedCart.totalPrice).toEqual(bookPrice);
        expect(lineItems.length).toEqual(1);
        expect(lineItems[0]?.bookId).toEqual(bookId);
        expect(lineItems[0]?.cartId).toEqual(cartId);
        expect(lineItems[0]?.price).toEqual(bookPrice);
        expect(lineItems[0]?.totalPrice).toEqual(bookPrice);
        expect(lineItems[0]?.quantity).toEqual(1);
      });
    });

    it('should remove line item from a cart if quantity to remove is greater of equal than total line item quantity', async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const cartRepository = cartRepositoryFactory.create(entityManager);

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const lineItemRepository = lineItemRepositoryFactory.create(entityManager);

        const { id: userId, email, password, role } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const { id: cartId } = cartEntityTestFactory.create();

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
        });

        const lineItem = await lineItemRepository.createOne({
          id: lineItemId,
          price,
          quantity,
          totalPrice,
          cartId: cart.id,
          bookId: book.id,
        });

        const updatedCart = await cartService.removeLineItem({
          unitOfWork,
          cartId: cart.id,
          draft: { lineItemId: lineItem.id, quantity: 3 },
        });

        const lineItems = updatedCart.lineItems as LineItem[];

        expect(updatedCart.totalPrice).toEqual(0);
        expect(lineItems.length).toEqual(0);
      });
    });

    it('should throw if cart with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { id: cartId } = cartEntityTestFactory.create();

        const { id: lineItemId } = lineItemEntityTestFactory.create();

        try {
          await cartService.removeLineItem({
            unitOfWork,
            cartId,
            draft: { lineItemId, quantity: 1 },
          });
        } catch (error) {
          expect(error).toBeInstanceOf(CartNotFoundError);
        }
      });
    });
  });

  it('should throw if line item with given id does not exist', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const entityManager = unitOfWork.getEntityManager();

      const userRepository = userRepositoryFactory.create(entityManager);

      const cartRepository = cartRepositoryFactory.create(entityManager);

      const customerRepository = customerRepositoryFactory.create(entityManager);

      const { id: userId, email, password, role } = userEntityTestFactory.create();

      const { id: customerId } = customerEntityTestFactory.create();

      const { id: cartId } = cartEntityTestFactory.create();

      const { id: lineItemId } = lineItemEntityTestFactory.create();

      const user = await userRepository.createOne({ id: userId, email: email as string, password, role });

      const customer = await customerRepository.createOne({ id: customerId, userId: user.id });

      await cartRepository.createOne({
        id: cartId,
        customerId: customer.id,
        status: CartStatus.active,
        totalPrice: 0,
      });

      try {
        await cartService.removeLineItem({
          unitOfWork,
          cartId,
          draft: { lineItemId, quantity: 1 },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(LineItemNotFoundError);
      }
    });
  });

  describe('Delete cart', () => {
    it('deletes cart from database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const cartRepository = cartRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const { id: userId, email, password, role } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const { id: cartId, status, totalPrice } = cartEntityTestFactory.create();

        const user = await userRepository.createOne({ id: userId, email: email as string, password, role });

        const customer = await customerRepository.createOne({ id: customerId, userId: user.id });

        const cart = await cartRepository.createOne({
          id: cartId,
          customerId: customer.id,
          status,
          totalPrice,
        });

        await cartService.deleteCart({ unitOfWork, cartId: cart.id });

        const foundCart = await cartRepository.findOne({ id: cart.id });

        expect(foundCart).toBeNull();
      });
    });

    it('should throw if cart with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { id } = cartEntityTestFactory.create();

        try {
          await cartService.deleteCart({ unitOfWork, cartId: id });
        } catch (error) {
          expect(error).toBeInstanceOf(CartNotFoundError);
        }
      });
    });
  });
});
