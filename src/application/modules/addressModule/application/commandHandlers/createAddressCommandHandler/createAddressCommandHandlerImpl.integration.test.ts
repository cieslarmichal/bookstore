import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { CreateAddressCommandHandler } from './createAddressCommandHandler';
import { TestTransactionInternalRunner } from '../../../../../../common/tests/testTransactionInternalRunner';
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

describe('CreateAddressCommandHandler', () => {
  let addressRepositoryFactory: AddressRepositoryFactory;
  let customerRepositoryFactory: CustomerRepositoryFactory;
  let userRepositoryFactory: UserRepositoryFactory;
  let createAddressCommandHandler: CreateAddressCommandHandler;

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

    createAddressCommandHandler = container.get<CreateAddressCommandHandler>(symbols.createAddressCommandHandler);

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('Create address', () => {
    it('creates address in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const addressRepository = addressRepositoryFactory.create(entityManager);

        const { id: userId, email, password } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress } =
          addressEntityTestFactory.create();

        const user = await userRepository.createUser({ id: userId, email: email as string, password });

        const customer = await customerRepository.createCustomer({ id: customerId, userId: user.id });

        const { address } = await createAddressCommandHandler.execute({
          unitOfWork,
          draft: {
            firstName,
            lastName,
            phoneNumber,
            country,
            state,
            city,
            zipCode,
            streetAddress,
            customerId: customer.id,
          },
        });

        const foundAddress = await addressRepository.findAddress({ id: address.id });

        expect(foundAddress).not.toBeNull();
      });
    });
  });
});
