import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { FindCustomerQueryHandler } from './findCustomerQueryHandler';
import { TestTransactionInternalRunner } from '../../../../../../common/tests/testTransactionInternalRunner';
import { postgresModuleSymbols } from '../../../../../../libs/postgres/postgresModuleSymbols';
import { Application } from '../../../../../application';
import { UserRepositoryFactory } from '../../../../userModule/application/repositories/userRepository/userRepositoryFactory';
import { UserEntityTestFactory } from '../../../../userModule/tests/factories/userEntityTestFactory/userEntityTestFactory';
import { userSymbols } from '../../../../userModule/symbols';
import { CustomerNotFoundError } from '../../errors/customerNotFoundError';
import { symbols } from '../../../symbols';
import { CustomerEntityTestFactory } from '../../../tests/factories/customerEntityTestFactory/customerEntityTestFactory';
import { CustomerRepositoryFactory } from '../../repositories/customerRepository/customerRepositoryFactory';

describe('FindCustomerQueryHandler', () => {
  let findCustomerQueryHandler: FindCustomerQueryHandler;
  let customerRepositoryFactory: CustomerRepositoryFactory;
  let userRepositoryFactory: UserRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

  const customerEntityTestFactory = new CustomerEntityTestFactory();
  const userEntityTestFactory = new UserEntityTestFactory();

  beforeAll(async () => {
    const container = Application.createContainer();

    findCustomerQueryHandler = container.get<FindCustomerQueryHandler>(symbols.findCustomerQueryHandler);
    customerRepositoryFactory = container.get<CustomerRepositoryFactory>(symbols.customerRepositoryFactory);
    userRepositoryFactory = container.get<UserRepositoryFactory>(userSymbols.userRepositoryFactory);
    dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('finds customer by id in database', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const entityManager = unitOfWork.getEntityManager();

      const userRepository = userRepositoryFactory.create(entityManager);

      const customerRepository = customerRepositoryFactory.create(entityManager);

      const { id: userId, email, password } = userEntityTestFactory.create();

      const { id: customerId } = customerEntityTestFactory.create();

      const user = await userRepository.createUser({ id: userId, email: email as string, password });

      const customer = await customerRepository.createCustomer({ id: customerId, userId: user.id });

      const { customer: foundCustomer } = await findCustomerQueryHandler.execute({
        unitOfWork,
        customerId: customer.id,
      });

      expect(foundCustomer).not.toBeNull();
    });
  });

  it('finds customer by userId in database', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const entityManager = unitOfWork.getEntityManager();

      const userRepository = userRepositoryFactory.create(entityManager);

      const customerRepository = customerRepositoryFactory.create(entityManager);

      const { id: userId, email, password } = userEntityTestFactory.create();

      const { id: customerId } = customerEntityTestFactory.create();

      const user = await userRepository.createUser({ id: userId, email: email as string, password });

      await customerRepository.createCustomer({ id: customerId, userId: user.id });

      const { customer: foundCustomer } = await findCustomerQueryHandler.execute({ unitOfWork, userId: user.id });

      expect(foundCustomer).not.toBeNull();
    });
  });

  it('should throw if customer with given id does not exist in db', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const { id } = customerEntityTestFactory.create();

      try {
        await findCustomerQueryHandler.execute({ unitOfWork, customerId: id });
      } catch (error) {
        expect(error).toBeInstanceOf(CustomerNotFoundError);
      }
    });
  });
});
