import { ConfigLoader } from '../../../../../../configLoader';
import { postgresConnector } from '../../../../../libs/postgres/postgresConnector';
import { PostgresModule } from '../../../../../libs/postgres/postgresModule';
import { createDIContainer } from '../../../../../libs/di/container';
import { LoggerModule } from '../../../../../libs/logger/loggerModule';
import { UnitOfWorkModule } from '../../../../../libs/unitOfWork/unitOfWorkModule';
import { TestTransactionInternalRunner } from '../../../../../tests/helpers';
import { CustomerEntity } from '../../../../customer/contracts/customerEntity';
import { UserEntity } from '../../../../user/contracts/userEntity';
import { UserEntityTestDataGenerator } from '../../../../user/tests/userEntityTestDataGenerator/userEntityTestDataGenerator';
import { ADDRESS_MAPPER } from '../../../addressSymbols';
import { AddressModule } from '../../../addressModule';
import { AddressEntity } from '../../../contracts/addressEntity';
import { AddressMapper } from '../../../contracts/mappers/addressMapper/addressMapper';
import { AddressEntityTestDataGenerator } from '../../../tests/addressEntityTestDataGenerator/addressTestDataGenerator';

describe('AddressMapperImpl', () => {
  let addressMapper: AddressMapper;
  let addressTestDataGenerator: AddressEntityTestDataGenerator;
  let userTestDataGenerator: UserEntityTestDataGenerator;
  let testTransactionRunner: TestTransactionInternalRunner;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([PostgresModule, AddressModule, LoggerModule, UnitOfWorkModule]);

    addressMapper = container.resolve(ADDRESS_MAPPER);

    testTransactionRunner = new TestTransactionInternalRunner(container);

    addressTestDataGenerator = new AddressEntityTestDataGenerator();
    userTestDataGenerator = new UserEntityTestDataGenerator();
  });

  afterAll(async () => {
    postgresConnector.closeConnection();
  });

  describe('Map address', () => {
    it('map address from entity to dto', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const { email, password, role } = userTestDataGenerator.generateData();

        const createdUser = entityManager.create(UserEntity, { email, password, role });

        const savedUser = await entityManager.save(createdUser);

        const createdCustomer = entityManager.create(CustomerEntity, { userId: savedUser.id });

        const savedCustomer = await entityManager.save(createdCustomer);

        const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress } =
          addressTestDataGenerator.generateData();

        const createdAddress = entityManager.create(AddressEntity, {
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

        const createdUser = entityManager.create(UserEntity, { email, password, role });

        const savedUser = await entityManager.save(createdUser);

        const createdCustomer = entityManager.create(CustomerEntity, { userId: savedUser.id });

        const savedCustomer = await entityManager.save(createdCustomer);

        const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress, deliveryInstructions } =
          addressTestDataGenerator.generateData();

        const createdAddress = entityManager.create(AddressEntity, {
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
