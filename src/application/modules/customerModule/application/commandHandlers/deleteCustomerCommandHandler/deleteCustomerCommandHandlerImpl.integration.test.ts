import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { DeleteCustomerCommandHandler } from './deleteCustomerCommandHandler';
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

describe('DeleteCustomerCommandHandler', () => {
  let deleteCustomerCommandHandler: DeleteCustomerCommandHandler;
  let customerRepositoryFactory: CustomerRepositoryFactory;
  let userRepositoryFactory: UserRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

  const customerEntityTestFactory = new CustomerEntityTestFactory();
  const userEntityTestFactory = new UserEntityTestFactory();

  beforeAll(async () => {
    const container = Application.createContainer();

    deleteCustomerCommandHandler = container.get<DeleteCustomerCommandHandler>(symbols.deleteCustomerCommandHandler);
    customerRepositoryFactory = container.get<CustomerRepositoryFactory>(symbols.customerRepositoryFactory);
    userRepositoryFactory = container.get<UserRepositoryFactory>(userSymbols.userRepositoryFactory);
    dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('deletes customer from database', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const entityManager = unitOfWork.getEntityManager();

      const userRepository = userRepositoryFactory.create(entityManager);

      const customerRepository = customerRepositoryFactory.create(entityManager);

      const { id: userId, email, password } = userEntityTestFactory.create();

      const { id: customerId } = customerEntityTestFactory.create();

      const user = await userRepository.createUser({ id: userId, email: email as string, password });

      const customer = await customerRepository.createCustomer({ id: customerId, userId: user.id });

      await deleteCustomerCommandHandler.execute({ unitOfWork, customerId: customer.id });

      const foundCustomer = await customerRepository.findCustomer({ id: customer.id });

      expect(foundCustomer).toBeNull();
    });
  });

  it('should throw if customer with given id does not exist', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const { id } = customerEntityTestFactory.create();

      try {
        await deleteCustomerCommandHandler.execute({ unitOfWork, customerId: id });
      } catch (error) {
        expect(error).toBeInstanceOf(CustomerNotFoundError);
      }
    });
  });
});
