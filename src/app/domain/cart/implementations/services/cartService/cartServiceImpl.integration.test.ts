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
import { BookEntity } from '../../../../book/contracts/bookEntity';
import { BookCategoryEntity } from '../../../../bookCategory/contracts/bookCategoryEntity';
import { CategoryEntity } from '../../../../category/contracts/categoryEntity';
import { CustomerEntity } from '../../../../customer/contracts/customerEntity';
import { CustomerRepositoryFactory } from '../../../../customer/contracts/factories/customerRepositoryFactory/customerRepositoryFactory';
import { CustomerModule } from '../../../../customer/customerModule';
import { customerSymbols } from '../../../../customer/customerSymbols';
import { CustomerEntityTestFactory } from '../../../../customer/tests/factories/customerEntityTestFactory/customerEntityTestFactory';
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
  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

  const cartEntityTestFactory = new CartEntityTestFactory();
  const userEntityTestFactory = new UserEntityTestFactory();
  const customerEntityTestFactory = new CustomerEntityTestFactory();

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
      ],
    });

    cartService = container.get<CartService>(cartSymbols.cartService);
    cartRepositoryFactory = container.get<CartRepositoryFactory>(cartSymbols.cartRepositoryFactory);
    customerRepositoryFactory = container.get<CustomerRepositoryFactory>(customerSymbols.customerRepositoryFactory);
    userRepositoryFactory = container.get<UserRepositoryFactory>(userSymbols.userRepositoryFactory);
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
