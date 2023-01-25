import 'reflect-metadata';

import { describe, it, beforeAll, afterAll, expect, vi } from 'vitest';

import { EqualFilter } from '../../../../../common/filter/filter';
import { FilterName } from '../../../../../common/filter/filterName';
import { FilterSymbol } from '../../../../../common/filter/filterSymbol';
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
import { CustomerRepositoryFactory } from '../../../../customer/contracts/factories/customerRepositoryFactory/customerRepositoryFactory';
import { CustomerModule } from '../../../../customer/customerModule';
import { customerSymbols } from '../../../../customer/customerSymbols';
import { UserRepositoryFactory } from '../../../../user/contracts/factories/userRepositoryFactory/userRepositoryFactory';
import { UserEntityTestFactory } from '../../../../user/tests/factories/userEntityTestFactory/userEntityTestFactory';
import { UserModuleConfigTestFactory } from '../../../../user/tests/factories/userModuleConfigTestFactory/userModuleConfigTestFactory';
import { UserModule } from '../../../../user/userModule';
import { userSymbols } from '../../../../user/userSymbols';
import { AddressModule } from '../../../addressModule';
import { addressSymbols } from '../../../addressSymbols';
import { AddressRepositoryFactory } from '../../../contracts/factories/addressRepositoryFactory/addressRepositoryFactory';
import { AddressService } from '../../../contracts/services/addressService/addressService';
import { AddressNotFoundError } from '../../../errors/addressNotFoundError';
import { AddressEntityTestFactory } from '../../../tests/factories/addressEntityTestFactory/addressEntityTestFactory';

describe('AddressServiceImpl', () => {
  const spyFactory = new SpyFactory(vi);

  let addressService: AddressService;
  let addressRepositoryFactory: AddressRepositoryFactory;
  let customerRepositoryFactory: CustomerRepositoryFactory;
  let userRepositoryFactory: UserRepositoryFactory;

  let testTransactionRunner: TestTransactionInternalRunner;
  let postgresConnector: PostgresConnector;

  const addressEntityTestFactory = new AddressEntityTestFactory();
  const userEntityTestFactory = new UserEntityTestFactory();
  const userModuleConfig = new UserModuleConfigTestFactory().create();
  const loggerModuleConfig = new LoggerModuleConfigTestFactory().create();
  const postgresModuleConfig = new PostgresModuleConfigTestFactory().create();

  beforeAll(async () => {
    const container = await createDependencyInjectionContainer([
      new PostgresModule(postgresModuleConfig),
      new AddressModule(),
      new LoggerModule(loggerModuleConfig),
      new CustomerModule(),
      new UserModule(userModuleConfig),
      new UnitOfWorkModule(),
    ]);

    addressService = container.resolve(addressSymbols.addressService);
    addressRepositoryFactory = container.resolve(addressSymbols.addressRepositoryFactory);
    customerRepositoryFactory = container.resolve(customerSymbols.customerRepositoryFactory);
    userRepositoryFactory = container.resolve(userSymbols.userRepositoryFactory);
    postgresConnector = container.resolve(postgresSymbols.postgresConnector);

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    postgresConnector.closeConnection();
  });

  describe('Create address', () => {
    it('creates address in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const { email, password, role } = userEntityTestFactory.create();

        const userRepository = userRepositoryFactory.create(entityManager);

        const user = await userRepository.createOne({ email: email as string, password, role });

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const customer = await customerRepository.createOne({ userId: user.id });

        const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress } =
          addressEntityTestFactory.create();

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

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const { email, password, role } = userEntityTestFactory.create();

        const userRepository = userRepositoryFactory.create(entityManager);

        const user = await userRepository.createOne({ email: email as string, password, role });

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const customer = await customerRepository.createOne({ userId: user.id });

        const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress } =
          addressEntityTestFactory.create();

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

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { id } = addressEntityTestFactory.create();

        try {
          await addressService.findAddress(unitOfWork, id);
        } catch (error) {
          expect(error).toBeInstanceOf(AddressNotFoundError);
        }
      });
    });
  });

  describe('Find addresses', () => {
    it('finds addresses by customerId', async () => {
      expect.assertions(3);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const { email, password, role } = userEntityTestFactory.create();

        const userRepository = userRepositoryFactory.create(entityManager);

        const user1 = await userRepository.createOne({ email: email as string, password, role });

        const { email: otherEmail } = userEntityTestFactory.create();

        const user2 = await userRepository.createOne({ email: otherEmail as string, password, role });

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const customer1 = await customerRepository.createOne({ userId: user1.id });

        const customer2 = await customerRepository.createOne({ userId: user2.id });

        const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress } =
          addressEntityTestFactory.create();

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

        const equalFilterForFirstNameField: EqualFilter = {
          fieldName: 'customerId',
          filterName: FilterName.equal,
          filterSymbol: FilterSymbol.equal,
          values: [customer1.id],
        };

        const foundAddresses = await addressService.findAddresses(unitOfWork, [equalFilterForFirstNameField], {
          page: 1,
          limit: 5,
        });

        expect(foundAddresses.length).toBe(2);
        expect(foundAddresses[0]).toStrictEqual(address1);
        expect(foundAddresses[1]).toStrictEqual(address2);
      });
    });

    it('finds addresses by customerId limited by pagination', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const { email, password, role } = userEntityTestFactory.create();

        const userRepository = userRepositoryFactory.create(entityManager);

        const user = await userRepository.createOne({ email: email as string, password, role });

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const customer = await customerRepository.createOne({ userId: user.id });

        const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress } =
          addressEntityTestFactory.create();

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

        const equalFilterForFirstNameField: EqualFilter = {
          fieldName: 'customerId',
          filterName: FilterName.equal,
          filterSymbol: FilterSymbol.equal,
          values: [customer.id],
        };

        const foundAddresses = await addressService.findAddresses(unitOfWork, [equalFilterForFirstNameField], {
          page: 1,
          limit: 5,
        });

        expect(foundAddresses.length).toBe(3);
      });
    });
  });

  describe('Remove address', () => {
    it('removes address from database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const { email, password, role } = userEntityTestFactory.create();

        const userRepository = userRepositoryFactory.create(entityManager);

        const user = await userRepository.createOne({ email: email as string, password, role });

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const customer = await customerRepository.createOne({ userId: user.id });

        const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress } =
          addressEntityTestFactory.create();

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

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { id } = addressEntityTestFactory.create();

        try {
          await addressService.removeAddress(unitOfWork, id);
        } catch (error) {
          expect(error).toBeInstanceOf(AddressNotFoundError);
        }
      });
    });
  });
});
