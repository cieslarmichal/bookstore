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
import { AddressEntity } from '../../../../address/contracts/addressEntity';
import { AuthorEntity } from '../../../../author/contracts/authorEntity';
import { AuthorBookEntity } from '../../../../authorBook/contracts/authorBookEntity';
import { BookEntity } from '../../../../book/contracts/bookEntity';
import { BookCategoryEntity } from '../../../../bookCategory/contracts/bookCategoryEntity';
import { CartEntity } from '../../../../cart/contracts/cartEntity';
import { CategoryEntity } from '../../../../category/contracts/categoryEntity';
import { InventoryEntity } from '../../../../inventoryModule/infrastructure/repositories/inventoryRepository/inventoryEntity/inventoryEntity';
import { LineItemEntity } from '../../../../lineItemModule/infrastructure/repositories/lineItemRepository/lineItemEntity/lineItemEntity';
import { OrderEntity } from '../../../../orderModule/infrastructure/repositories/orderRepository/orderEntity/orderEntity';
import { ReviewEntity } from '../../../../reviewModule/infrastructure/repositories/reviewRepository/reviewEntity/reviewEntity';
import { UserRepositoryFactory } from '../../../../userModule/application/repositories/userRepository/userRepositoryFactory';
import { UserEntity } from '../../../../userModule/infrastructure/repositories/userRepository/userEntity/userEntity';
import { UserEntityTestFactory } from '../../../../userModule/tests/factories/userEntityTestFactory/userEntityTestFactory';
import { UserModuleConfigTestFactory } from '../../../../userModule/tests/factories/userModuleConfigTestFactory/userModuleConfigTestFactory';
import { UserModule } from '../../../../userModule/userModule';
import { userModuleSymbols } from '../../../../userModule/userModuleSymbols';
import { CustomerRepositoryFactory } from '../../../application/repositories/customerRepository/customerRepositoryFactory';
import { CustomerEntity } from '../../../contracts/customerEntity';
import { CustomerService } from '../../../contracts/services/customerService/customerService';
import { CustomerModule } from '../../../customerModule';
import { customerModuleSymbols } from '../../../customerModuleSymbols';
import { CustomerAlreadyExistsError } from '../../../infrastructure/errors/customerAlreadyExistsError';
import { CustomerNotFoundError } from '../../../infrastructure/errors/customerNotFoundError';
import { CustomerEntityTestFactory } from '../../../tests/factories/customerEntityTestFactory/customerEntityTestFactory';

describe('CustomerServiceImpl', () => {
  let customerService: CustomerService;
  let customerRepositoryFactory: CustomerRepositoryFactory;
  let userRepositoryFactory: UserRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

  const customerEntityTestFactory = new CustomerEntityTestFactory();
  const userEntityTestFactory = new UserEntityTestFactory();

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
        new CustomerModule(),
        new LoggerModule(loggerModuleConfig),
        new UserModule(userModuleConfig),
        new UnitOfWorkModule(),
      ],
    });

    customerService = container.get<CustomerService>(customerModuleSymbols.customerService);
    customerRepositoryFactory = container.get<CustomerRepositoryFactory>(
      customerModuleSymbols.customerRepositoryFactory,
    );
    userRepositoryFactory = container.get<UserRepositoryFactory>(userModuleSymbols.userRepositoryFactory);
    dataSource = container.get<DataSource>(postgresSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('Create customer', () => {
    it('creates customer in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const { id: userId, email, password, role } = userEntityTestFactory.create();

        const user = await userRepository.createOne({ id: userId, email: email as string, password, role });

        const customer = await customerService.createCustomer({ unitOfWork, draft: { userId: user.id } });

        const foundCustomer = await customerRepository.findOne({ id: customer.id });

        expect(foundCustomer).not.toBeNull();
      });
    });

    it('throws if customer with userId already exists in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const { id: userId, email, password, role } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const user = await userRepository.createOne({ id: userId, email: email as string, password, role });

        await customerRepository.createOne({ id: customerId, userId: user.id });

        try {
          await customerService.createCustomer({ unitOfWork, draft: { userId: user.id } });
        } catch (error) {
          expect(error).toBeInstanceOf(CustomerAlreadyExistsError);
        }
      });
    });
  });

  describe('Find customer', () => {
    it('finds customer by id in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const { id: userId, email, password, role } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const user = await userRepository.createOne({ id: userId, email: email as string, password, role });

        const customer = await customerRepository.createOne({ id: customerId, userId: user.id });

        const foundCustomer = await customerService.findCustomer({ unitOfWork, customerId: customer.id });

        expect(foundCustomer).not.toBeNull();
      });
    });

    it('finds customer by userId in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const { id: userId, email, password, role } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const user = await userRepository.createOne({ id: userId, email: email as string, password, role });

        await customerRepository.createOne({ id: customerId, userId: user.id });

        const foundCustomer = await customerService.findCustomer({ unitOfWork, userId: user.id });

        expect(foundCustomer).not.toBeNull();
      });
    });

    it('should throw if customer with given id does not exist in db', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { id } = customerEntityTestFactory.create();

        try {
          await customerService.findCustomer({ unitOfWork, customerId: id });
        } catch (error) {
          expect(error).toBeInstanceOf(CustomerNotFoundError);
        }
      });
    });
  });

  describe('Delete customer', () => {
    it('deletes customer from database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const { id: userId, email, password, role } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const user = await userRepository.createOne({ id: userId, email: email as string, password, role });

        const customer = await customerRepository.createOne({ id: customerId, userId: user.id });

        await customerService.deleteCustomer({ unitOfWork, customerId: customer.id });

        const foundCustomer = await customerRepository.findOne({ id: customer.id });

        expect(foundCustomer).toBeNull();
      });
    });

    it('should throw if customer with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { id } = customerEntityTestFactory.create();

        try {
          await customerService.deleteCustomer({ unitOfWork, customerId: id });
        } catch (error) {
          expect(error).toBeInstanceOf(CustomerNotFoundError);
        }
      });
    });
  });
});