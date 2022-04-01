import { CustomerRepository } from '../repositories/customerRepository';
import { CustomerService } from './customerService';
import { CustomerTestDataGenerator } from '../testDataGenerators/customerTestDataGenerator';
import { ConfigLoader } from '../../../../configLoader';
import { createDIContainer } from '../../../shared';
import { DbModule } from '../../../shared';
import { CustomerModule } from '../customerModule';
import { CustomerAlreadyExists, CustomerNotFound } from '../errors';
import { PostgresHelper } from '../../../../integration/helpers/postgresHelper/postgresHelper';
import { LoggerModule } from '../../../shared/logger/loggerModule';
import { CUSTOMER_REPOSITORY_FACTORY, CUSTOMER_SERVICE } from '../customerInjectionSymbols';
import { UserTestDataGenerator } from '../../user/testDataGenerators/userTestDataGenerator';
import { UserRepository } from '../../user/repositories/userRepository';
import { USER_REPOSITORY_FACTORY } from '../../user/userInjectionSymbols';
import { UserModule } from '../../user/userModule';
import { ENTITY_MANAGER } from '../../../shared/db/dbInjectionSymbols';

describe('CustomerService', () => {
  let customerService: CustomerService;
  let customerRepository: CustomerRepository;
  let userRepository: UserRepository;
  let customerTestDataGenerator: CustomerTestDataGenerator;
  let userTestDataGenerator: UserTestDataGenerator;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([DbModule, CustomerModule, LoggerModule, UserModule]);

    const entityManager = container.resolve(ENTITY_MANAGER);
    customerService = container.resolve(CUSTOMER_SERVICE);
    customerRepository = container.resolve(CUSTOMER_REPOSITORY_FACTORY).create(entityManager);
    userRepository = container.resolve(USER_REPOSITORY_FACTORY).create(entityManager);

    customerTestDataGenerator = new CustomerTestDataGenerator();
    userTestDataGenerator = new UserTestDataGenerator();
  });

  afterEach(async () => {
    await PostgresHelper.removeDataFromTables();
  });

  describe('Create customer', () => {
    it('creates customer in database', async () => {
      expect.assertions(1);

      const { email, password, role } = userTestDataGenerator.generateData();

      const user = await userRepository.createOne({ email, password, role });

      const createdCustomerDto = await customerService.createCustomer({ userId: user.id });

      const customerDto = await customerRepository.findOneById(createdCustomerDto.id);

      expect(customerDto).not.toBeNull();
    });

    it('throws if customer with userId already exists in database', async () => {
      expect.assertions(1);

      const { email, password, role } = userTestDataGenerator.generateData();

      const user = await userRepository.createOne({ email, password, role });

      await customerRepository.createOne({ userId: user.id });

      try {
        await customerService.createCustomer({ userId: user.id });
      } catch (error) {
        expect(error).toBeInstanceOf(CustomerAlreadyExists);
      }
    });
  });

  describe('Find customer', () => {
    it('finds customer by id in database', async () => {
      expect.assertions(1);

      const { email, password, role } = userTestDataGenerator.generateData();

      const user = await userRepository.createOne({ email, password, role });

      const customer = await customerRepository.createOne({ userId: user.id });

      const foundCustomer = await customerService.findCustomer({ id: customer.id });

      expect(foundCustomer).not.toBeNull();
    });

    it('finds customer by userId in database', async () => {
      expect.assertions(1);

      const { email, password, role } = userTestDataGenerator.generateData();

      const user = await userRepository.createOne({ email, password, role });

      await customerRepository.createOne({ userId: user.id });

      const foundCustomer = await customerService.findCustomer({ userId: user.id });

      expect(foundCustomer).not.toBeNull();
    });

    it('should throw if customer with given id does not exist in db', async () => {
      expect.assertions(1);

      const { id } = customerTestDataGenerator.generateData();

      try {
        await customerService.findCustomer({ id });
      } catch (error) {
        expect(error).toBeInstanceOf(CustomerNotFound);
      }
    });
  });

  describe('Remove customer', () => {
    it('removes customer from database', async () => {
      expect.assertions(1);

      const { email, password, role } = userTestDataGenerator.generateData();

      const user = await userRepository.createOne({ email, password, role });

      const customer = await customerRepository.createOne({ userId: user.id });

      await customerService.removeCustomer(customer.id);

      const customerDto = await customerRepository.findOneById(customer.id);

      expect(customerDto).toBeNull();
    });

    it('should throw if customer with given id does not exist', async () => {
      expect.assertions(1);

      const { id } = customerTestDataGenerator.generateData();

      try {
        await customerService.removeCustomer(id);
      } catch (error) {
        expect(error).toBeInstanceOf(CustomerNotFound);
      }
    });
  });
});
