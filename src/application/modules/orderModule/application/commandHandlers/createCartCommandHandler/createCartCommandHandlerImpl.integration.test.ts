import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { CreateCartCommandHandler } from './createCartCommandHandler';
import { TestTransactionInternalRunner } from '../../../../../../common/tests/testTransactionInternalRunner';
import { postgresModuleSymbols } from '../../../../../../libs/postgres/postgresModuleSymbols';
import { Application } from '../../../../../application';
import { CustomerRepositoryFactory } from '../../../../customerModule/application/repositories/customerRepository/customerRepositoryFactory';
import { customerSymbols } from '../../../../customerModule/symbols';
import { CustomerEntityTestFactory } from '../../../../customerModule/tests/factories/customerEntityTestFactory/customerEntityTestFactory';
import { UserRepositoryFactory } from '../../../../userModule/application/repositories/userRepository/userRepositoryFactory';
import { UserEntityTestFactory } from '../../../../userModule/tests/factories/userEntityTestFactory/userEntityTestFactory';
import { userSymbols } from '../../../../userModule/symbols';
import { symbols } from '../../../symbols';
import { CartRepositoryFactory } from '../../repositories/cartRepository/cartRepositoryFactory';

describe('CreateCartCommandHandler', () => {
  let createCartCommandHandler: CreateCartCommandHandler;
  let cartRepositoryFactory: CartRepositoryFactory;
  let userRepositoryFactory: UserRepositoryFactory;
  let customerRepositoryFactory: CustomerRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

  const userEntityTestFactory = new UserEntityTestFactory();
  const customerEntityTestFactory = new CustomerEntityTestFactory();

  beforeAll(async () => {
    const container = Application.createContainer();

    createCartCommandHandler = container.get<CreateCartCommandHandler>(symbols.createCartCommandHandler);
    cartRepositoryFactory = container.get<CartRepositoryFactory>(symbols.cartRepositoryFactory);
    customerRepositoryFactory = container.get<CustomerRepositoryFactory>(customerSymbols.customerRepositoryFactory);
    userRepositoryFactory = container.get<UserRepositoryFactory>(userSymbols.userRepositoryFactory);
    dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('creates cart in database', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const entityManager = unitOfWork.getEntityManager();

      const userRepository = userRepositoryFactory.create(entityManager);

      const cartRepository = cartRepositoryFactory.create(entityManager);

      const customerRepository = customerRepositoryFactory.create(entityManager);

      const { id: userId, email, password } = userEntityTestFactory.create();

      const { id: customerId } = customerEntityTestFactory.create();

      const user = await userRepository.createUser({ id: userId, email: email as string, password });

      const customer = await customerRepository.createCustomer({ id: customerId, userId: user.id });

      const { cart } = await createCartCommandHandler.execute({ unitOfWork, draft: { customerId: customer.id } });

      const foundCart = await cartRepository.findCart({ id: cart.id });

      expect(foundCart).not.toBeNull();
    });
  });
});
