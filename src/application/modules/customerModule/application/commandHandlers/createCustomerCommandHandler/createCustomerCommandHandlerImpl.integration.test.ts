import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { CreateCustomerCommandHandler } from './createCustomerCommandHandler';
import { TestTransactionInternalRunner } from '../../../../../../common/tests/testTransactionInternalRunner';
import { postgresModuleSymbols } from '../../../../../../libs/postgres/postgresModuleSymbols';
import { Application } from '../../../../../application';
import { UserRepositoryFactory } from '../../../../userModule/application/repositories/userRepository/userRepositoryFactory';
import { userSymbols } from '../../../../userModule/symbols';
import { UserEntityTestFactory } from '../../../../userModule/tests/factories/userEntityTestFactory/userEntityTestFactory';
import { symbols } from '../../../symbols';
import { CustomerEntityTestFactory } from '../../../tests/factories/customerEntityTestFactory/customerEntityTestFactory';
import { CustomerAlreadyExistsError } from '../../errors/customerAlreadyExistsError';
import { CustomerRepositoryFactory } from '../../repositories/customerRepository/customerRepositoryFactory';

describe('CreateCustomerCommandHandler', () => {
  let createCustomerCommandHandler: CreateCustomerCommandHandler;
  let customerRepositoryFactory: CustomerRepositoryFactory;
  let userRepositoryFactory: UserRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

  const customerEntityTestFactory = new CustomerEntityTestFactory();
  const userEntityTestFactory = new UserEntityTestFactory();

  beforeAll(async () => {
    const container = Application.createContainer();

    createCustomerCommandHandler = container.get<CreateCustomerCommandHandler>(symbols.createCustomerCommandHandler);
    customerRepositoryFactory = container.get<CustomerRepositoryFactory>(symbols.customerRepositoryFactory);
    userRepositoryFactory = container.get<UserRepositoryFactory>(userSymbols.userRepositoryFactory);
    dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('creates customer in database', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const entityManager = unitOfWork.getEntityManager();

      const userRepository = userRepositoryFactory.create(entityManager);

      const customerRepository = customerRepositoryFactory.create(entityManager);

      const { id: userId, email, password } = userEntityTestFactory.create();

      const user = await userRepository.createUser({ id: userId, email: email as string, password });

      const { customer } = await createCustomerCommandHandler.execute({ unitOfWork, draft: { userId: user.id } });

      const foundCustomer = await customerRepository.findCustomer({ id: customer.id });

      expect(foundCustomer).not.toBeNull();
    });
  });

  it('throws if customer with userId already exists in database', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const entityManager = unitOfWork.getEntityManager();

      const userRepository = userRepositoryFactory.create(entityManager);

      const customerRepository = customerRepositoryFactory.create(entityManager);

      const { id: userId, email, password } = userEntityTestFactory.create();

      const { id: customerId } = customerEntityTestFactory.create();

      const user = await userRepository.createUser({ id: userId, email: email as string, password });

      await customerRepository.createCustomer({ id: customerId, userId: user.id });

      try {
        await createCustomerCommandHandler.execute({ unitOfWork, draft: { userId: user.id } });
      } catch (error) {
        expect(error).toBeInstanceOf(CustomerAlreadyExistsError);
      }
    });
  });
});
