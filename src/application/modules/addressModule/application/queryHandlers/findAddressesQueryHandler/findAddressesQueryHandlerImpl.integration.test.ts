import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { FindAddressesQueryHandler } from './findAddressesQueryHandler';
import { TestTransactionInternalRunner } from '../../../../../../common/tests/testTransactionInternalRunner';
import { EqualFilter } from '../../../../../../common/types/filter';
import { FilterName } from '../../../../../../common/types/filterName';
import { FilterSymbol } from '../../../../../../common/types/filterSymbol';
import { postgresModuleSymbols } from '../../../../../../libs/postgres/postgresModuleSymbols';
import { Application } from '../../../../../application';
import { CustomerRepositoryFactory } from '../../../../customerModule/application/repositories/customerRepository/customerRepositoryFactory';
import { customerSymbols } from '../../../../customerModule/symbols';
import { CustomerEntityTestFactory } from '../../../../customerModule/tests/factories/customerEntityTestFactory/customerEntityTestFactory';
import { UserRepositoryFactory } from '../../../../userModule/application/repositories/userRepository/userRepositoryFactory';
import { userSymbols } from '../../../../userModule/symbols';
import { UserEntityTestFactory } from '../../../../userModule/tests/factories/userEntityTestFactory/userEntityTestFactory';
import { symbols } from '../../../symbols';
import { AddressEntityTestFactory } from '../../../tests/factories/addressEntityTestFactory/addressEntityTestFactory';
import { AddressRepositoryFactory } from '../../repositories/addressRepository/addressRepositoryFactory';

describe('FindAddressesQueryHandler', () => {
  let addressRepositoryFactory: AddressRepositoryFactory;
  let customerRepositoryFactory: CustomerRepositoryFactory;
  let userRepositoryFactory: UserRepositoryFactory;
  let findAddressesQueryHandler: FindAddressesQueryHandler;

  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

  const addressEntityTestFactory = new AddressEntityTestFactory();
  const userEntityTestFactory = new UserEntityTestFactory();
  const customerEntityTestFactory = new CustomerEntityTestFactory();

  beforeAll(async () => {
    const container = Application.createContainer();

    addressRepositoryFactory = container.get<AddressRepositoryFactory>(symbols.addressRepositoryFactory);
    customerRepositoryFactory = container.get<CustomerRepositoryFactory>(customerSymbols.customerRepositoryFactory);
    userRepositoryFactory = container.get<UserRepositoryFactory>(userSymbols.userRepositoryFactory);
    dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);

    await dataSource.initialize();

    findAddressesQueryHandler = container.get<FindAddressesQueryHandler>(symbols.findAddressesQueryHandler);

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('finds addresses by customerId', async () => {
    expect.assertions(3);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const entityManager = unitOfWork.getEntityManager();

      const userRepository = userRepositoryFactory.create(entityManager);

      const customerRepository = customerRepositoryFactory.create(entityManager);

      const addressRepository = addressRepositoryFactory.create(entityManager);

      const { id: userId1, email: email1, password } = userEntityTestFactory.create();

      const { id: userId2, email: email2 } = userEntityTestFactory.create();

      const { id: customerId1 } = customerEntityTestFactory.create();

      const { id: customerId2 } = customerEntityTestFactory.create();

      const {
        id: addressId1,
        firstName,
        lastName,
        phoneNumber,
        country,
        state,
        city,
        zipCode,
        streetAddress,
      } = addressEntityTestFactory.create();

      const { id: addressId2 } = addressEntityTestFactory.create();

      const { id: addressId3 } = addressEntityTestFactory.create();

      const user1 = await userRepository.createUser({ id: userId1, email: email1 as string, password });

      const user2 = await userRepository.createUser({ id: userId2, email: email2 as string, password });

      const customer1 = await customerRepository.createCustomer({ id: customerId1, userId: user1.id });

      const customer2 = await customerRepository.createCustomer({ id: customerId2, userId: user2.id });

      const address1 = await addressRepository.createAddress({
        id: addressId1,
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

      const address2 = await addressRepository.createAddress({
        id: addressId2,
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

      await addressRepository.createAddress({
        id: addressId3,
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

      const { addresses } = await findAddressesQueryHandler.execute({
        unitOfWork,
        filters: [equalFilterForFirstNameField],
        pagination: {
          page: 1,
          limit: 5,
        },
      });

      expect(addresses.length).toBe(2);
      expect(addresses[0]).toStrictEqual(address1);
      expect(addresses[1]).toStrictEqual(address2);
    });
  });

  it('finds addresses by customerId limited by pagination', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const entityManager = unitOfWork.getEntityManager();

      const userRepository = userRepositoryFactory.create(entityManager);

      const customerRepository = customerRepositoryFactory.create(entityManager);

      const addressRepository = addressRepositoryFactory.create(entityManager);

      const { id: userId, email, password } = userEntityTestFactory.create();

      const { id: customerId } = customerEntityTestFactory.create();

      const {
        id: addressId1,
        firstName,
        lastName,
        phoneNumber,
        country,
        state,
        city,
        zipCode,
        streetAddress,
      } = addressEntityTestFactory.create();

      const { id: addressId2 } = addressEntityTestFactory.create();

      const { id: addressId3 } = addressEntityTestFactory.create();

      const user = await userRepository.createUser({ id: userId, email: email as string, password });

      const customer = await customerRepository.createCustomer({ id: customerId, userId: user.id });

      await addressRepository.createAddress({
        id: addressId1,
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

      await addressRepository.createAddress({
        id: addressId2,
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

      await addressRepository.createAddress({
        id: addressId3,
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

      const { addresses } = await findAddressesQueryHandler.execute({
        unitOfWork,
        filters: [equalFilterForFirstNameField],
        pagination: {
          page: 1,
          limit: 5,
        },
      });

      expect(addresses.length).toBe(3);
    });
  });
});
