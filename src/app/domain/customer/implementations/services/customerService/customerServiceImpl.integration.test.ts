import { ConfigLoader } from '../../../../../../configLoader';
import { postgresConnector } from '../../../../../libs/postgres/postgresConnector';
import { PostgresModule } from '../../../../../libs/postgres/postgresModule';
import { createDependencyInjectionContainer } from '../../../../../libs/dependencyInjection/container';
import { LoggerModule } from '../../../../../libs/logger/loggerModule';
import { UnitOfWorkModule } from '../../../../../libs/unitOfWork/unitOfWorkModule';
import { TestTransactionInternalRunner } from '../../../../../tests/helpers';
import { UserEntityTestDataGenerator } from '../../../../user/tests/userEntityTestDataGenerator/userEntityTestDataGenerator';
import { UserModule } from '../../../../user/userModule';
import { CustomerRepositoryFactory } from '../../../contracts/factories/customerRepositoryFactory/customerRepositoryFactory';
import { CustomerService } from '../../../contracts/services/customerService/customerService';
import { CustomerModule } from '../../../customerModule';
import { CustomerAlreadyExists } from '../../../errors/customerAlreadyExists';
import { CustomerNotFound } from '../../../errors/customerNotFound';
import { CustomerEntityTestFactory } from '../../../tests/factories/customerEntityTestFactory/customerEntityTestFactory';
import { UserRepositoryFactory } from '../../../../user/contracts/factories/userRepositoryFactory/userRepositoryFactory';
import { customerSymbols } from '../../../customerSymbols';
import { userSymbols } from '../../../../user/userSymbols';

describe('CustomerServiceImpl', () => {
  let customerService: CustomerService;
  let customerRepositoryFactory: CustomerRepositoryFactory;
  let userRepositoryFactory: UserRepositoryFactory;
  let customerEntityTestFactory: CustomerEntityTestFactory;
  let userEntityTestFactory: UserEntityTestDataGenerator;
  let testTransactionRunner: TestTransactionInternalRunner;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDependencyInjectionContainer([
      PostgresModule,
      CustomerModule,
      LoggerModule,
      UserModule,
      UnitOfWorkModule,
    ]);

    customerService = container.resolve(customerSymbols.customerService);
    customerRepositoryFactory = container.resolve(customerSymbols.customerRepositoryFactory);
    userRepositoryFactory = container.resolve(userSymbols.userRepositoryFactory);

    testTransactionRunner = new TestTransactionInternalRunner(container);

    customerEntityTestFactory = new CustomerEntityTestFactory();
    userEntityTestFactory = new UserEntityTestDataGenerator();
  });

  afterAll(async () => {
    postgresConnector.closeConnection();
  });

  describe('Create customer', () => {
    it('creates customer in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const userRepository = userRepositoryFactory.create(entityManager);
        const customerRepository = customerRepositoryFactory.create(entityManager);

        const { email, password, role } = userEntityTestFactory.generateData();

        const user = await userRepository.createOne({ email, password, role });

        const createdCustomerDto = await customerService.createCustomer(unitOfWork, { userId: user.id });

        const customerDto = await customerRepository.findOneById(createdCustomerDto.id);

        expect(customerDto).not.toBeNull();
      });
    });

    it('throws if customer with userId already exists in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const userRepository = userRepositoryFactory.create(entityManager);
        const customerRepository = customerRepositoryFactory.create(entityManager);

        const { email, password, role } = userEntityTestFactory.generateData();

        const user = await userRepository.createOne({ email, password, role });

        await customerRepository.createOne({ userId: user.id });

        try {
          await customerService.createCustomer(unitOfWork, { userId: user.id });
        } catch (error) {
          expect(error).toBeInstanceOf(CustomerAlreadyExists);
        }
      });
    });
  });

  describe('Find customer', () => {
    it('finds customer by id in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const userRepository = userRepositoryFactory.create(entityManager);
        const customerRepository = customerRepositoryFactory.create(entityManager);

        const { email, password, role } = userEntityTestFactory.generateData();

        const user = await userRepository.createOne({ email, password, role });

        const customer = await customerRepository.createOne({ userId: user.id });

        const foundCustomer = await customerService.findCustomer(unitOfWork, { id: customer.id });

        expect(foundCustomer).not.toBeNull();
      });
    });

    it('finds customer by userId in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const userRepository = userRepositoryFactory.create(entityManager);
        const customerRepository = customerRepositoryFactory.create(entityManager);

        const { email, password, role } = userEntityTestFactory.generateData();

        const user = await userRepository.createOne({ email, password, role });

        await customerRepository.createOne({ userId: user.id });

        const foundCustomer = await customerService.findCustomer(unitOfWork, { userId: user.id });

        expect(foundCustomer).not.toBeNull();
      });
    });

    it('should throw if customer with given id does not exist in db', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { id } = customerEntityTestFactory.create();

        try {
          await customerService.findCustomer(unitOfWork, { id });
        } catch (error) {
          expect(error).toBeInstanceOf(CustomerNotFound);
        }
      });
    });
  });

  describe('Remove customer', () => {
    it('removes customer from database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const userRepository = userRepositoryFactory.create(entityManager);
        const customerRepository = customerRepositoryFactory.create(entityManager);

        const { email, password, role } = userEntityTestFactory.generateData();

        const user = await userRepository.createOne({ email, password, role });

        const customer = await customerRepository.createOne({ userId: user.id });

        await customerService.removeCustomer(unitOfWork, customer.id);

        const customerDto = await customerRepository.findOneById(customer.id);

        expect(customerDto).toBeNull();
      });
    });

    it('should throw if customer with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { id } = customerEntityTestFactory.create();

        try {
          await customerService.removeCustomer(unitOfWork, id);
        } catch (error) {
          expect(error).toBeInstanceOf(CustomerNotFound);
        }
      });
    });
  });
});
