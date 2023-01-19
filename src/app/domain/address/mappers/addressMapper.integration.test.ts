import { Address } from '../entities/address';
import { AddressMapper } from './addressMapper';
import { AddressTestDataGenerator } from '../testDataGenerators/addressTestDataGenerator';
import { ConfigLoader } from '../../../../configLoader';
import { createDIContainer, dbManager, UnitOfWorkModule } from '../../../common';
import { DbModule } from '../../../common';
import { AddressModule } from '../addressModule';
import { TestTransactionInternalRunner } from '../../../../integration/helpers/unitOfWorkHelper/testTransactionInternalRunner';
import { LoggerModule } from '../../../common/logger/loggerModule';
import { ADDRESS_MAPPER } from '../addressInjectionSymbols';
import { UserTestDataGenerator } from '../../user/testDataGenerators/userTestDataGenerator';
import { User } from '../../user/entities/user';
import { Customer } from '../../customer/entities/customer';

describe('AddressMapper', () => {
  let addressMapper: AddressMapper;
  let addressTestDataGenerator: AddressTestDataGenerator;
  let userTestDataGenerator: UserTestDataGenerator;
  let testTransactionRunner: TestTransactionInternalRunner;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([DbModule, AddressModule, LoggerModule, UnitOfWorkModule]);

    addressMapper = container.resolve(ADDRESS_MAPPER);

    testTransactionRunner = new TestTransactionInternalRunner(container);

    addressTestDataGenerator = new AddressTestDataGenerator();
    userTestDataGenerator = new UserTestDataGenerator();
  });

  afterAll(async () => {
    dbManager.closeConnection();
  });

  describe('Map address', () => {
    it('map address from entity to dto', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const { email, password, role } = userTestDataGenerator.generateData();

        const createdUser = entityManager.create(User, { email, password, role });

        const savedUser = await entityManager.save(createdUser);

        const createdCustomer = entityManager.create(Customer, { userId: savedUser.id });

        const savedCustomer = await entityManager.save(createdCustomer);

        const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress } =
          addressTestDataGenerator.generateData();

        const createdAddress = entityManager.create(Address, {
          firstName,
          lastName,
          phoneNumber,
          country,
          state,
          city,
          zipCode,
          streetAddress,
          customerId: savedCustomer.id,
        });

        const savedAddress = await entityManager.save(createdAddress);

        const addressDto = addressMapper.map(savedAddress);

        expect(addressDto).toEqual({
          id: savedAddress.id,
          createdAt: savedAddress.createdAt,
          updatedAt: savedAddress.updatedAt,
          firstName: savedAddress.firstName,
          lastName: savedAddress.lastName,
          phoneNumber: savedAddress.phoneNumber,
          country: savedAddress.country,
          state: savedAddress.state,
          city: savedAddress.city,
          zipCode: savedAddress.zipCode,
          streetAddress: savedAddress.streetAddress,
          deliveryInstructions: null,
          customerId: savedCustomer.id,
        });
      });
    });

    it('map address from entity to dto with optional fields', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const { email, password, role } = userTestDataGenerator.generateData();

        const createdUser = entityManager.create(User, { email, password, role });

        const savedUser = await entityManager.save(createdUser);

        const createdCustomer = entityManager.create(Customer, { userId: savedUser.id });

        const savedCustomer = await entityManager.save(createdCustomer);

        const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress, deliveryInstructions } =
          addressTestDataGenerator.generateData();

        const createdAddress = entityManager.create(Address, {
          firstName,
          lastName,
          phoneNumber,
          country,
          state,
          city,
          zipCode,
          streetAddress,
          deliveryInstructions,
          customerId: savedCustomer.id,
        });

        const savedAddress = await entityManager.save(createdAddress);

        const addressDto = addressMapper.map(savedAddress);

        expect(addressDto).toEqual({
          id: savedAddress.id,
          createdAt: savedAddress.createdAt,
          updatedAt: savedAddress.updatedAt,
          firstName: savedAddress.firstName,
          lastName: savedAddress.lastName,
          phoneNumber: savedAddress.phoneNumber,
          country: savedAddress.country,
          state: savedAddress.state,
          city: savedAddress.city,
          zipCode: savedAddress.zipCode,
          streetAddress: savedAddress.streetAddress,
          deliveryInstructions: savedAddress.deliveryInstructions,
          customerId: savedCustomer.id,
        });
      });
    });
  });
});
