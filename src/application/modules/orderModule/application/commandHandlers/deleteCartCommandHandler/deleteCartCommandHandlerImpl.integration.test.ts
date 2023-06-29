import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { DeleteCartCommandHandler } from './deleteCartCommandHandler';
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
import { CartEntityTestFactory } from '../../../tests/factories/cartEntityTestFactory/cartEntityTestFactory';
import { CartNotFoundError } from '../../errors/cartNotFoundError';
import { CartRepositoryFactory } from '../../repositories/cartRepository/cartRepositoryFactory';

describe('DeleteCartCommandHandler', () => {
  let deleteCartCommandHandler: DeleteCartCommandHandler;
  let cartRepositoryFactory: CartRepositoryFactory;
  let userRepositoryFactory: UserRepositoryFactory;
  let customerRepositoryFactory: CustomerRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

  const cartEntityTestFactory = new CartEntityTestFactory();
  const userEntityTestFactory = new UserEntityTestFactory();
  const customerEntityTestFactory = new CustomerEntityTestFactory();

  beforeAll(async () => {
    const container = Application.createContainer();

    deleteCartCommandHandler = container.get<DeleteCartCommandHandler>(symbols.deleteCartCommandHandler);
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

  it('deletes cart from database', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const entityManager = unitOfWork.getEntityManager();

      const userRepository = userRepositoryFactory.create(entityManager);

      const cartRepository = cartRepositoryFactory.create(entityManager);

      const customerRepository = customerRepositoryFactory.create(entityManager);

      const { id: userId, email, password } = userEntityTestFactory.create();

      const { id: customerId } = customerEntityTestFactory.create();

      const { id: cartId, status, totalPrice } = cartEntityTestFactory.create();

      const user = await userRepository.createUser({ id: userId, email: email as string, password });

      const customer = await customerRepository.createCustomer({ id: customerId, userId: user.id });

      const cart = await cartRepository.createCart({
        id: cartId,
        customerId: customer.id,
        status,
        totalPrice,
      });

      await deleteCartCommandHandler.execute({ unitOfWork, cartId: cart.id });

      const foundCart = await cartRepository.findCart({ id: cart.id });

      expect(foundCart).toBeNull();
    });
  });

  it('should throw if cart with given id does not exist', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const { id } = cartEntityTestFactory.create();

      try {
        await deleteCartCommandHandler.execute({ unitOfWork, cartId: id });
      } catch (error) {
        expect(error).toBeInstanceOf(CartNotFoundError);
      }
    });
  });
});
