import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { UpdateCartCommandHandler } from './updateCartCommandHandler';
import { TestTransactionInternalRunner } from '../../../../../../common/tests/testTransactionInternalRunner';
import { postgresModuleSymbols } from '../../../../../../libs/postgres/postgresModuleSymbols';
import { Application } from '../../../../../application';
import { CustomerRepositoryFactory } from '../../../../customerModule/application/repositories/customerRepository/customerRepositoryFactory';
import { customerSymbols } from '../../../../customerModule/symbols';
import { CustomerEntityTestFactory } from '../../../../customerModule/tests/factories/customerEntityTestFactory/customerEntityTestFactory';
import { UserRepositoryFactory } from '../../../../userModule/application/repositories/userRepository/userRepositoryFactory';
import { userSymbols } from '../../../../userModule/symbols';
import { UserEntityTestFactory } from '../../../../userModule/tests/factories/userEntityTestFactory/userEntityTestFactory';
import { CartStatus } from '../../../domain/entities/cart/cartStatus';
import { DeliveryMethod } from '../../../domain/entities/cart/deliveryMethod';
import { symbols } from '../../../symbols';
import { CartEntityTestFactory } from '../../../tests/factories/cartEntityTestFactory/cartEntityTestFactory';
import { CartNotFoundError } from '../../errors/cartNotFoundError';
import { CartRepositoryFactory } from '../../repositories/cartRepository/cartRepositoryFactory';

describe('UpdateCartCommandHandler', () => {
  let updateCartCommandHandler: UpdateCartCommandHandler;
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

    updateCartCommandHandler = container.get<UpdateCartCommandHandler>(symbols.updateCartCommandHandler);
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

  it('updates cart in database', async () => {
    expect.assertions(2);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const entityManager = unitOfWork.getEntityManager();

      const userRepository = userRepositoryFactory.create(entityManager);

      const cartRepository = cartRepositoryFactory.create(entityManager);

      const customerRepository = customerRepositoryFactory.create(entityManager);

      const { id: userId, email, password } = userEntityTestFactory.create();

      const { id: customerId } = customerEntityTestFactory.create();

      const { id: cartId, totalPrice } = cartEntityTestFactory.create();

      const user = await userRepository.createUser({ id: userId, email: email as string, password });

      const customer = await customerRepository.createCustomer({ id: customerId, userId: user.id });

      const cart = await cartRepository.createCart({
        id: cartId,
        customerId: customer.id,
        status: CartStatus.active,
        totalPrice,
      });

      const { cart: updatedCart } = await updateCartCommandHandler.execute({
        unitOfWork,
        cartId: cart.id,
        draft: { status: CartStatus.inactive },
      });

      expect(updatedCart.id).toEqual(cartId);
      expect(updatedCart.status).toEqual(CartStatus.inactive);
    });
  });

  it('should throw if cart with given id does not exist', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const { id, deliveryMethod } = cartEntityTestFactory.create();

      try {
        await updateCartCommandHandler.execute({
          unitOfWork,
          cartId: id,
          draft: { deliveryMethod: deliveryMethod as DeliveryMethod },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(CartNotFoundError);
      }
    });
  });
});
