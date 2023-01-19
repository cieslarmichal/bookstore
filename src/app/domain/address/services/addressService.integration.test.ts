import { AddressService } from './addressService';
import { AddressTestDataGenerator } from '../testDataGenerators/addressTestDataGenerator';
import { ConfigLoader } from '../../../../configLoader';
import { createDIContainer, dbManager, EqualFilter, UnitOfWorkModule } from '../../../common';
import { DbModule } from '../../../common';
import { AddressModule } from '../addressModule';
import { AddressNotFound } from '../errors';
import { TestTransactionInternalRunner } from '../../../../integration/helpers/unitOfWorkHelper/testTransactionInternalRunner';
import { LoggerModule } from '../../../common/logger/loggerModule';
import { ADDRESS_REPOSITORY_FACTORY, ADDRESS_SERVICE } from '../addressInjectionSymbols';
import { CUSTOMER_REPOSITORY_FACTORY } from '../../customer/customerInjectionSymbols';
import { CustomerModule } from '../../customer/customerModule';
import { USER_REPOSITORY_FACTORY } from '../../user/userInjectionSymbols';
import { UserModule } from '../../user/userModule';
import { UserTestDataGenerator } from '../../user/testDataGenerators/userTestDataGenerator';
import { AddressRepositoryFactory } from '../repositories/addressRepositoryFactory';
import { CustomerRepositoryFactory } from '../../customer/repositories/customerRepositoryFactory';
import { UserRepositoryFactory } from '../../user/repositories/userRepositoryFactory';

describe('AddressService', () => {
  let addressService: AddressService;
  let addressRepositoryFactory: AddressRepositoryFactory;
  let customerRepositoryFactory: CustomerRepositoryFactory;
  let userRepositoryFactory: UserRepositoryFactory;
  let addressTestDataGenerator: AddressTestDataGenerator;
  let userTestDataGenerator: UserTestDataGenerator;
  let testTransactionRunner: TestTransactionInternalRunner;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([
      DbModule,
      AddressModule,
      LoggerModule,
      CustomerModule,
      UserModule,
      UnitOfWorkModule,
    ]);

    addressService = container.resolve(ADDRESS_SERVICE);
    addressRepositoryFactory = container.resolve(ADDRESS_REPOSITORY_FACTORY);
    customerRepositoryFactory = container.resolve(CUSTOMER_REPOSITORY_FACTORY);
    userRepositoryFactory = container.resolve(USER_REPOSITORY_FACTORY);

    testTransactionRunner = new TestTransactionInternalRunner(container);

    addressTestDataGenerator = new AddressTestDataGenerator();
    userTestDataGenerator = new UserTestDataGenerator();
  });

  afterAll(async () => {
    dbManager.closeConnection();
  });

  describe('Create address', () => {
    it('creates address in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const { email, password, role } = userTestDataGenerator.generateData();

        const userRepository = userRepositoryFactory.create(entityManager);

        const user = await userRepository.createOne({ email, password, role });

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const customer = await customerRepository.createOne({ userId: user.id });

        const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress } =
          addressTestDataGenerator.generateData();

        const createdAddressDto = await addressService.createAddress(unitOfWork, {
          firstName,
          lastName,
          phoneNumber,
          country,
          state,
          city,
          zipCode,
          streetAddress,
          customerId: customer.id,
        });

        const addressRepository = addressRepositoryFactory.create(entityManager);

        const addressDto = await addressRepository.findOneById(createdAddressDto.id);

        expect(addressDto).not.toBeNull();
      });
    });
  });

  describe('Find address', () => {
    it('finds address by id in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const { email, password, role } = userTestDataGenerator.generateData();

        const userRepository = userRepositoryFactory.create(entityManager);

        const user = await userRepository.createOne({ email, password, role });

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const customer = await customerRepository.createOne({ userId: user.id });

        const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress } =
          addressTestDataGenerator.generateData();

        const addressRepository = addressRepositoryFactory.create(entityManager);

        const address = await addressRepository.createOne({
          firstName,
          lastName,
          phoneNumber,
          country,
          state,
          city,
          zipCode,
          streetAddress,
          customerId: customer.id,
        });

        const foundAddress = await addressService.findAddress(unitOfWork, address.id);

        expect(foundAddress).not.toBeNull();
      });
    });

    it('should throw if address with given id does not exist in db', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { id } = addressTestDataGenerator.generateData();

        try {
          await addressService.findAddress(unitOfWork, id);
        } catch (error) {
          expect(error).toBeInstanceOf(AddressNotFound);
        }
      });
    });
  });

  describe('Find addresses', () => {
    it('finds addresses by customerId', async () => {
      expect.assertions(3);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const { email, password, role } = userTestDataGenerator.generateData();

        const userRepository = userRepositoryFactory.create(entityManager);

        const user1 = await userRepository.createOne({ email, password, role });

        const { email: otherEmail } = userTestDataGenerator.generateData();

        const user2 = await userRepository.createOne({ email: otherEmail, password, role });

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const customer1 = await customerRepository.createOne({ userId: user1.id });

        const customer2 = await customerRepository.createOne({ userId: user2.id });

        const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress } =
          addressTestDataGenerator.generateData();

        const addressRepository = addressRepositoryFactory.create(entityManager);

        const address1 = await addressRepository.createOne({
          firstName,
          lastName,
          phoneNumber,
          country,
          state,
          city,
          zipCode,
          streetAddress,
          customerId: customer1.id,
        });

        const address2 = await addressRepository.createOne({
          firstName,
          lastName,
          phoneNumber,
          country,
          state,
          city,
          zipCode,
          streetAddress,
          customerId: customer1.id,
        });

        await addressRepository.createOne({
          firstName,
          lastName,
          phoneNumber,
          country,
          state,
          city,
          zipCode,
          streetAddress,
          customerId: customer2.id,
        });

        const foundAddresses = await addressService.findAddresses(
          unitOfWork,
          [new EqualFilter('customerId', [customer1.id])],
          {
            page: 1,
            limit: 5,
          },
        );

        expect(foundAddresses.length).toBe(2);
        expect(foundAddresses[0]).toStrictEqual(address1);
        expect(foundAddresses[1]).toStrictEqual(address2);
      });
    });

    it('finds addresses by customerId limited by pagination', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const { email, password, role } = userTestDataGenerator.generateData();

        const userRepository = userRepositoryFactory.create(entityManager);

        const user = await userRepository.createOne({ email, password, role });

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const customer = await customerRepository.createOne({ userId: user.id });

        const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress } =
          addressTestDataGenerator.generateData();

        const addressRepository = addressRepositoryFactory.create(entityManager);

        await addressRepository.createOne({
          firstName,
          lastName,
          phoneNumber,
          country,
          state,
          city,
          zipCode,
          streetAddress,
          customerId: customer.id,
        });

        await addressRepository.createOne({
          firstName,
          lastName,
          phoneNumber,
          country,
          state,
          city,
          zipCode,
          streetAddress,
          customerId: customer.id,
        });

        await addressRepository.createOne({
          firstName,
          lastName,
          phoneNumber,
          country,
          state,
          city,
          zipCode,
          streetAddress,
          customerId: customer.id,
        });

        const foundAddresses = await addressService.findAddresses(
          unitOfWork,
          [new EqualFilter('customerId', [customer.id])],
          {
            page: 1,
            limit: 5,
          },
        );

        expect(foundAddresses.length).toBe(3);
      });
    });
  });

  describe('Remove address', () => {
    it('removes address from database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const { email, password, role } = userTestDataGenerator.generateData();

        const userRepository = userRepositoryFactory.create(entityManager);

        const user = await userRepository.createOne({ email, password, role });

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const customer = await customerRepository.createOne({ userId: user.id });

        const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress } =
          addressTestDataGenerator.generateData();

        const addressRepository = addressRepositoryFactory.create(entityManager);

        const address = await addressRepository.createOne({
          firstName,
          lastName,
          phoneNumber,
          country,
          state,
          city,
          zipCode,
          streetAddress,
          customerId: customer.id,
        });

        await addressService.removeAddress(unitOfWork, address.id);

        const addressDto = await addressRepository.findOneById(address.id);

        expect(addressDto).toBeNull();
      });
    });

    it('should throw if address with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { id } = addressTestDataGenerator.generateData();

        try {
          await addressService.removeAddress(unitOfWork, id);
        } catch (error) {
          expect(error).toBeInstanceOf(AddressNotFound);
        }
      });
    });
  });
});
