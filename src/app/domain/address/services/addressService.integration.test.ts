import { AddressRepository } from '../repositories/addressRepository';
import { AddressService } from './addressService';
import { AddressTestDataGenerator } from '../testDataGenerators/addressTestDataGenerator';
import { ConfigLoader } from '../../../../configLoader';
import { createDIContainer, EqualFilter } from '../../../shared';
import { DbModule } from '../../../shared';
import { AddressModule } from '../addressModule';
import { AddressNotFound } from '../errors';
import { PostgresHelper } from '../../../../integration/helpers/postgresHelper/postgresHelper';
import { LoggerModule } from '../../../shared/logger/loggerModule';
import { ADDRESS_REPOSITORY_FACTORY, ADDRESS_SERVICE } from '../addressInjectionSymbols';
import { CustomerRepository } from '../../customer/repositories/customerRepository';
import { CUSTOMER_REPOSITORY_FACTORY } from '../../customer/customerInjectionSymbols';
import { CustomerModule } from '../../customer/customerModule';
import { UserRepository } from '../../user/repositories/userRepository';
import { USER_REPOSITORY_FACTORY } from '../../user/userInjectionSymbols';
import { UserModule } from '../../user/userModule';
import { UserTestDataGenerator } from '../../user/testDataGenerators/userTestDataGenerator';
import { ENTITY_MANAGER } from '../../../shared/db/dbInjectionSymbols';

describe('AddressService', () => {
  let addressService: AddressService;
  let addressRepository: AddressRepository;
  let customerRepository: CustomerRepository;
  let userRepository: UserRepository;
  let addressTestDataGenerator: AddressTestDataGenerator;
  let userTestDataGenerator: UserTestDataGenerator;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([DbModule, AddressModule, LoggerModule, CustomerModule, UserModule]);

    const entityManager = container.resolve(ENTITY_MANAGER);
    addressService = container.resolve(ADDRESS_SERVICE);
    addressRepository = container.resolve(ADDRESS_REPOSITORY_FACTORY).create(entityManager);
    customerRepository = container.resolve(CUSTOMER_REPOSITORY_FACTORY).create(entityManager);
    userRepository = container.resolve(USER_REPOSITORY_FACTORY).create(entityManager);

    addressTestDataGenerator = new AddressTestDataGenerator();
    userTestDataGenerator = new UserTestDataGenerator();
  });

  afterEach(async () => {
    await PostgresHelper.removeDataFromTables();
  });

  describe('Create address', () => {
    it('creates address in database', async () => {
      expect.assertions(1);

      const { email, password, role } = userTestDataGenerator.generateData();

      const user = await userRepository.createOne({ email, password, role });

      const customer = await customerRepository.createOne({ userId: user.id });

      const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress } =
        addressTestDataGenerator.generateData();

      const createdAddressDto = await addressService.createAddress({
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

      const addressDto = await addressRepository.findOneById(createdAddressDto.id);

      expect(addressDto).not.toBeNull();
    });
  });

  describe('Find address', () => {
    it('finds address by id in database', async () => {
      expect.assertions(1);

      const { email, password, role } = userTestDataGenerator.generateData();

      const user = await userRepository.createOne({ email, password, role });

      const customer = await customerRepository.createOne({ userId: user.id });

      const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress } =
        addressTestDataGenerator.generateData();

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

      const foundAddress = await addressService.findAddress(address.id);

      expect(foundAddress).not.toBeNull();
    });

    it('should throw if address with given id does not exist in db', async () => {
      expect.assertions(1);

      const { id } = addressTestDataGenerator.generateData();

      try {
        await addressService.findAddress(id);
      } catch (error) {
        expect(error).toBeInstanceOf(AddressNotFound);
      }
    });
  });

  describe('Find addresses', () => {
    it('finds addresses by customerId', async () => {
      expect.assertions(3);

      const { email, password, role } = userTestDataGenerator.generateData();

      const user1 = await userRepository.createOne({ email, password, role });

      const { email: otherEmail } = userTestDataGenerator.generateData();

      const user2 = await userRepository.createOne({ email: otherEmail, password, role });

      const customer1 = await customerRepository.createOne({ userId: user1.id });

      const customer2 = await customerRepository.createOne({ userId: user2.id });

      const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress } =
        addressTestDataGenerator.generateData();

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

      const foundAddresses = await addressService.findAddresses([new EqualFilter('customerId', [customer1.id])], {
        page: 1,
        limit: 5,
      });

      expect(foundAddresses.length).toBe(2);
      expect(foundAddresses[0]).toStrictEqual(address1);
      expect(foundAddresses[1]).toStrictEqual(address2);
    });

    it('finds addresses by customerId limited by pagination', async () => {
      expect.assertions(1);

      const { email, password, role } = userTestDataGenerator.generateData();

      const user = await userRepository.createOne({ email, password, role });

      const customer = await customerRepository.createOne({ userId: user.id });

      const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress } =
        addressTestDataGenerator.generateData();

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

      const foundAddresses = await addressService.findAddresses([new EqualFilter('customerId', [customer.id])], {
        page: 1,
        limit: 5,
      });

      expect(foundAddresses.length).toBe(3);
    });
  });

  describe('Remove address', () => {
    it('removes address from database', async () => {
      expect.assertions(1);

      const { email, password, role } = userTestDataGenerator.generateData();

      const user = await userRepository.createOne({ email, password, role });

      const customer = await customerRepository.createOne({ userId: user.id });

      const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress } =
        addressTestDataGenerator.generateData();

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

      await addressService.removeAddress(address.id);

      const addressDto = await addressRepository.findOneById(address.id);

      expect(addressDto).toBeNull();
    });

    it('should throw if address with given id does not exist', async () => {
      expect.assertions(1);

      const { id } = addressTestDataGenerator.generateData();

      try {
        await addressService.removeAddress(id);
      } catch (error) {
        expect(error).toBeInstanceOf(AddressNotFound);
      }
    });
  });
});
