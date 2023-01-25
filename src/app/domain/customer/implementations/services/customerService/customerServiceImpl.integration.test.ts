import 'reflect-metadata';

import { describe, it, beforeAll, afterAll, expect, vi } from 'vitest';

import { createDependencyInjectionContainer } from '../../../../../libs/dependencyInjection/container';
import { LoggerModule } from '../../../../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../../../../libs/logger/loggerModuleConfigTestFactory';
import { PostgresConnector } from '../../../../../libs/postgres/postgresConnector';
import { PostgresModule } from '../../../../../libs/postgres/postgresModule';
import { PostgresModuleConfigTestFactory } from '../../../../../libs/postgres/postgresModuleConfigTestFactory';
import { postgresSymbols } from '../../../../../libs/postgres/postgresSymbols';
import { UnitOfWorkModule } from '../../../../../libs/unitOfWork/unitOfWorkModule';
import { SpyFactory } from '../../../../../tests/factories/spyFactory';
import { TestTransactionInternalRunner } from '../../../../../tests/unitOfWork/testTransactionInternalRunner';
import { UserRepositoryFactory } from '../../../../user/contracts/factories/userRepositoryFactory/userRepositoryFactory';
import { UserEntityTestFactory } from '../../../../user/tests/factories/userEntityTestFactory/userEntityTestFactory';
import { UserModuleConfigTestFactory } from '../../../../user/tests/factories/userModuleConfigTestFactory/userModuleConfigTestFactory';
import { UserModule } from '../../../../user/userModule';
import { userSymbols } from '../../../../user/userSymbols';
import { CustomerRepositoryFactory } from '../../../contracts/factories/customerRepositoryFactory/customerRepositoryFactory';
import { CustomerService } from '../../../contracts/services/customerService/customerService';
import { CustomerModule } from '../../../customerModule';
import { customerSymbols } from '../../../customerSymbols';
import { CustomerAlreadyExistsError } from '../../../errors/customerAlreadyExistsError';
import { CustomerNotFoundError } from '../../../errors/customerNotFoundError';
import { CustomerEntityTestFactory } from '../../../tests/factories/customerEntityTestFactory/customerEntityTestFactory';

describe('CustomerServiceImpl', () => {
  const spyFactory = new SpyFactory(vi);

  let customerService: CustomerService;
  let customerRepositoryFactory: CustomerRepositoryFactory;
  let userRepositoryFactory: UserRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let postgresConnector: PostgresConnector;

  const customerEntityTestFactory = new CustomerEntityTestFactory();
  const userEntityTestFactory = new UserEntityTestFactory();

  const loggerModuleConfig = new LoggerModuleConfigTestFactory().create();
  const postgresModuleConfig = new PostgresModuleConfigTestFactory().create();
  const userModuleConfig = new UserModuleConfigTestFactory().create();

  beforeAll(async () => {
    const container = await createDependencyInjectionContainer([
      new PostgresModule(postgresModuleConfig),
      new CustomerModule(),
      new LoggerModule(loggerModuleConfig),
      new UserModule(userModuleConfig),
      new UnitOfWorkModule(),
    ]);

    customerService = container.resolve(customerSymbols.customerService);
    customerRepositoryFactory = container.resolve(customerSymbols.customerRepositoryFactory);
    userRepositoryFactory = container.resolve(userSymbols.userRepositoryFactory);
    postgresConnector = container.resolve(postgresSymbols.postgresConnector);

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    postgresConnector.closeConnection();
  });

  describe('Create customer', () => {
    it('creates customer in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const userRepository = userRepositoryFactory.create(entityManager);
        const customerRepository = customerRepositoryFactory.create(entityManager);

        const { email, password, role } = userEntityTestFactory.create();

        const user = await userRepository.createOne({ email: email as string, password, role });

        const createdCustomerDto = await customerService.createCustomer(unitOfWork, { userId: user.id });

        const customerDto = await customerRepository.findOneById(createdCustomerDto.id);

        expect(customerDto).not.toBeNull();
      });
    });

    it('throws if customer with userId already exists in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const userRepository = userRepositoryFactory.create(entityManager);
        const customerRepository = customerRepositoryFactory.create(entityManager);

        const { email, password, role } = userEntityTestFactory.create();

        const user = await userRepository.createOne({ email: email as string, password, role });

        await customerRepository.createOne({ userId: user.id });

        try {
          await customerService.createCustomer(unitOfWork, { userId: user.id });
        } catch (error) {
          expect(error).toBeInstanceOf(CustomerAlreadyExistsError);
        }
      });
    });
  });

  describe('Find customer', () => {
    it('finds customer by id in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const userRepository = userRepositoryFactory.create(entityManager);
        const customerRepository = customerRepositoryFactory.create(entityManager);

        const { email, password, role } = userEntityTestFactory.create();

        const user = await userRepository.createOne({ email: email as string, password, role });

        const customer = await customerRepository.createOne({ userId: user.id });

        const foundCustomer = await customerService.findCustomer(unitOfWork, { id: customer.id });

        expect(foundCustomer).not.toBeNull();
      });
    });

    it('finds customer by userId in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const userRepository = userRepositoryFactory.create(entityManager);
        const customerRepository = customerRepositoryFactory.create(entityManager);

        const { email, password, role } = userEntityTestFactory.create();

        const user = await userRepository.createOne({ email: email as string, password, role });

        await customerRepository.createOne({ userId: user.id });

        const foundCustomer = await customerService.findCustomer(unitOfWork, { userId: user.id });

        expect(foundCustomer).not.toBeNull();
      });
    });

    it('should throw if customer with given id does not exist in db', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { id } = customerEntityTestFactory.create();

        try {
          await customerService.findCustomer(unitOfWork, { id });
        } catch (error) {
          expect(error).toBeInstanceOf(CustomerNotFoundError);
        }
      });
    });
  });

  describe('Remove customer', () => {
    it('removes customer from database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const userRepository = userRepositoryFactory.create(entityManager);
        const customerRepository = customerRepositoryFactory.create(entityManager);

        const { email, password, role } = userEntityTestFactory.create();

        const user = await userRepository.createOne({ email: email as string, password, role });

        const customer = await customerRepository.createOne({ userId: user.id });

        await customerService.removeCustomer(unitOfWork, customer.id);

        const customerDto = await customerRepository.findOneById(customer.id);

        expect(customerDto).toBeNull();
      });
    });

    it('should throw if customer with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { id } = customerEntityTestFactory.create();

        try {
          await customerService.removeCustomer(unitOfWork, id);
        } catch (error) {
          expect(error).toBeInstanceOf(CustomerNotFoundError);
        }
      });
    });
  });
});
