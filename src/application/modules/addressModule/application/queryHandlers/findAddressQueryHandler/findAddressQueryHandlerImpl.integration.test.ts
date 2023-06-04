import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { FindAddressQueryHandler } from './findAddressQueryHandler';
import { TestTransactionInternalRunner } from '../../../../../../common/tests/testTransactionInternalRunner';
import { postgresModuleSymbols } from '../../../../../../libs/postgres/postgresModuleSymbols';
import { Application } from '../../../../../application';
import { CustomerRepositoryFactory } from '../../../../customerModule/application/repositories/customerRepository/customerRepositoryFactory';
import { customerSymbols } from '../../../../customerModule/symbols';
import { CustomerEntityTestFactory } from '../../../../customerModule/tests/factories/customerEntityTestFactory/customerEntityTestFactory';
import { UserRepositoryFactory } from '../../../../userModule/application/repositories/userRepository/userRepositoryFactory';
import { userSymbols } from '../../../../userModule/symbols';
import { UserEntityTestFactory } from '../../../../userModule/tests/factories/userEntityTestFactory/userEntityTestFactory';
import { AddressNotFoundError } from '../../../infrastructure/errors/addressNotFoundError';
import { symbols } from '../../../symbols';
import { AddressEntityTestFactory } from '../../../tests/factories/addressEntityTestFactory/addressEntityTestFactory';
import { AddressRepositoryFactory } from '../../repositories/addressRepository/addressRepositoryFactory';

describe('FindAddressQueryHandler', () => {
  let addressRepositoryFactory: AddressRepositoryFactory;
  let customerRepositoryFactory: CustomerRepositoryFactory;
  let userRepositoryFactory: UserRepositoryFactory;
  let findAddressQueryHandler: FindAddressQueryHandler;

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

    findAddressQueryHandler = container.get<FindAddressQueryHandler>(symbols.findAddressQueryHandler);

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('finds address by id in database', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const entityManager = unitOfWork.getEntityManager();

      const userRepository = userRepositoryFactory.create(entityManager);

      const customerRepository = customerRepositoryFactory.create(entityManager);

      const addressRepository = addressRepositoryFactory.create(entityManager);

      const { id: userId, email, password } = userEntityTestFactory.create();

      const { id: customerId } = customerEntityTestFactory.create();

      const {
        id: addressId,
        firstName,
        lastName,
        phoneNumber,
        country,
        state,
        city,
        zipCode,
        streetAddress,
      } = addressEntityTestFactory.create();

      const user = await userRepository.createUser({ id: userId, email: email as string, password });

      const customer = await customerRepository.createCustomer({ id: customerId, userId: user.id });

      const address = await addressRepository.createAddress({
        id: addressId,
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

      const foundAddress = await findAddressQueryHandler.execute({ unitOfWork, addressId: address.id });

      expect(foundAddress).not.toBeNull();
    });
  });

  it('should throw if address with given id does not exist in db', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const { id } = addressEntityTestFactory.create();

      try {
        await findAddressQueryHandler.execute({ unitOfWork, addressId: id });
      } catch (error) {
        expect(error).toBeInstanceOf(AddressNotFoundError);
      }
    });
  });
});
