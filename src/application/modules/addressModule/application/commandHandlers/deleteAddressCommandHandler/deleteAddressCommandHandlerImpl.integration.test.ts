import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { DeleteAddressCommandHandler } from './deleteAddressCommandHandler';
import { TestTransactionInternalRunner } from '../../../../../../common/tests/testTransactionInternalRunner';
import { postgresModuleSymbols } from '../../../../../../libs/postgres/postgresModuleSymbols';
import { Application } from '../../../../../application';
import { CustomerRepositoryFactory } from '../../../../customerModule/application/repositories/customerRepository/customerRepositoryFactory';
import { customerSymbols } from '../../../../customerModule/symbols';
import { CustomerEntityTestFactory } from '../../../../customerModule/tests/factories/customerEntityTestFactory/customerEntityTestFactory';
import { UserRepositoryFactory } from '../../../../userModule/application/repositories/userRepository/userRepositoryFactory';
import { UserEntityTestFactory } from '../../../../userModule/tests/factories/userEntityTestFactory/userEntityTestFactory';
import { userModuleSymbols } from '../../../../userModule/userModuleSymbols';
import { AddressNotFoundError } from '../../../infrastructure/errors/addressNotFoundError';
import { symbols } from '../../../symbols';
import { AddressEntityTestFactory } from '../../../tests/factories/addressEntityTestFactory/addressEntityTestFactory';
import { AddressRepositoryFactory } from '../../repositories/addressRepository/addressRepositoryFactory';

describe('DeleteAddressCommandHandler', () => {
  let addressRepositoryFactory: AddressRepositoryFactory;
  let customerRepositoryFactory: CustomerRepositoryFactory;
  let userRepositoryFactory: UserRepositoryFactory;
  let deleteAddressCommandHandler: DeleteAddressCommandHandler;

  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

  const addressEntityTestFactory = new AddressEntityTestFactory();
  const userEntityTestFactory = new UserEntityTestFactory();
  const customerEntityTestFactory = new CustomerEntityTestFactory();

  beforeAll(async () => {
    const container = Application.createContainer();

    addressRepositoryFactory = container.get<AddressRepositoryFactory>(symbols.addressRepositoryFactory);
    customerRepositoryFactory = container.get<CustomerRepositoryFactory>(customerSymbols.customerRepositoryFactory);
    userRepositoryFactory = container.get<UserRepositoryFactory>(userModuleSymbols.userRepositoryFactory);
    dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);

    await dataSource.initialize();

    deleteAddressCommandHandler = container.get<DeleteAddressCommandHandler>(symbols.deleteAddressCommandHandler);

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('deletes address from database', async () => {
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

      const user = await userRepository.createOne({ id: userId, email: email as string, password });

      const customer = await customerRepository.createCustomer({ id: customerId, userId: user.id });

      const address = await addressRepository.createAddress({
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

      await deleteAddressCommandHandler.execute({ unitOfWork, addressId: address.id });

      const foundAddress = await addressRepository.findAddress({ id: address.id });

      expect(foundAddress).toBeNull();
    });
  });

  it('should throw if address with given id does not exist', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const { id } = addressEntityTestFactory.create();

      try {
        await deleteAddressCommandHandler.execute({ unitOfWork, addressId: id });
      } catch (error) {
        expect(error).toBeInstanceOf(AddressNotFoundError);
      }
    });
  });
});
