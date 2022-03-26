import { EntityManager } from 'typeorm';
import { Address } from '../entities/address';
import { AddressMapper } from './addressMapper';
import { AddressTestDataGenerator } from '../testDataGenerators/addressTestDataGenerator';
import { ConfigLoader } from '../../../../configLoader';
import { createDIContainer } from '../../../shared';
import { DbModule } from '../../../shared';
import { AddressModule } from '../addressModule';
import { PostgresHelper } from '../../../../integration/helpers/postgresHelper/postgresHelper';
import { LoggerModule } from '../../../shared/logger/loggerModule';
import { ENTITY_MANAGER } from '../../../shared/db/dbInjectionSymbols';
import { ADDRESS_MAPPER } from '../addressInjectionSymbols';
import { UserTestDataGenerator } from '../../user/testDataGenerators/userTestDataGenerator';
import { User } from '../../user/entities/user';
import { Customer } from '../../customer/entities/customer';

describe('AddressMapper', () => {
  let addressMapper: AddressMapper;
  let addressTestDataGenerator: AddressTestDataGenerator;
  let userTestDataGenerator: UserTestDataGenerator;
  let entityManager: EntityManager;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([DbModule, AddressModule, LoggerModule]);

    addressMapper = container.resolve(ADDRESS_MAPPER);
    entityManager = container.resolve(ENTITY_MANAGER);

    addressTestDataGenerator = new AddressTestDataGenerator();
    userTestDataGenerator = new UserTestDataGenerator();
  });

  afterEach(async () => {
    await PostgresHelper.removeDataFromTables();
  });

  describe('Map address', () => {
    it('map address from entity to dto', async () => {
      expect.assertions(1);

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

      const addressDto = addressMapper.mapEntityToDto(savedAddress);

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

    it('map address from entity to dto with optional fields', async () => {
      expect.assertions(1);

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

      const addressDto = addressMapper.mapEntityToDto(savedAddress);

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
