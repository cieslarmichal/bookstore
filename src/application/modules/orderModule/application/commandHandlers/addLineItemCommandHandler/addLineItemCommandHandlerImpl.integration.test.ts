import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { AddLineItemCommandHandler } from './addLineItemCommandHandler';
import { TestTransactionInternalRunner } from '../../../../../../common/tests/testTransactionInternalRunner';
import { postgresModuleSymbols } from '../../../../../../libs/postgres/postgresModuleSymbols';
import { Application } from '../../../../../application';
import { BookRepositoryFactory } from '../../../../bookModule/application/repositories/bookRepository/bookRepositoryFactory';
import { bookSymbols } from '../../../../bookModule/symbols';
import { BookEntityTestFactory } from '../../../../bookModule/tests/factories/bookEntityTestFactory/bookEntityTestFactory';
import { CustomerRepositoryFactory } from '../../../../customerModule/application/repositories/customerRepository/customerRepositoryFactory';
import { customerSymbols } from '../../../../customerModule/symbols';
import { CustomerEntityTestFactory } from '../../../../customerModule/tests/factories/customerEntityTestFactory/customerEntityTestFactory';
import { InventoryRepositoryFactory } from '../../../../inventoryModule/application/repositories/inventoryRepository/inventoryRepositoryFactory';
import { inventorySymbols } from '../../../../inventoryModule/symbols';
import { InventoryEntityTestFactory } from '../../../../inventoryModule/tests/factories/inventoryEntityTestFactory/inventoryEntityTestFactory';
import { UserRepositoryFactory } from '../../../../userModule/application/repositories/userRepository/userRepositoryFactory';
import { userSymbols } from '../../../../userModule/symbols';
import { UserEntityTestFactory } from '../../../../userModule/tests/factories/userEntityTestFactory/userEntityTestFactory';
import { CartStatus } from '../../../domain/entities/cart/cartStatus';
import { LineItem } from '../../../domain/entities/lineItem/lineItem';
import { symbols } from '../../../symbols';
import { CartEntityTestFactory } from '../../../tests/factories/cartEntityTestFactory/cartEntityTestFactory';
import { CartNotFoundError } from '../../errors/cartNotFoundError';
import { CartRepositoryFactory } from '../../repositories/cartRepository/cartRepositoryFactory';

describe('AddLineItemCommandHandler', () => {
  let addLineItemCommandHandler: AddLineItemCommandHandler;
  let cartRepositoryFactory: CartRepositoryFactory;
  let userRepositoryFactory: UserRepositoryFactory;
  let customerRepositoryFactory: CustomerRepositoryFactory;
  let bookRepositoryFactory: BookRepositoryFactory;
  let inventoryRepositoryFactory: InventoryRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

  const cartEntityTestFactory = new CartEntityTestFactory();
  const userEntityTestFactory = new UserEntityTestFactory();
  const customerEntityTestFactory = new CustomerEntityTestFactory();
  const bookEntityTestFactory = new BookEntityTestFactory();
  const inventoryEntityTestFactory = new InventoryEntityTestFactory();

  beforeAll(async () => {
    const container = Application.createContainer();

    addLineItemCommandHandler = container.get<AddLineItemCommandHandler>(symbols.addLineItemCommandHandler);
    cartRepositoryFactory = container.get<CartRepositoryFactory>(symbols.cartRepositoryFactory);
    customerRepositoryFactory = container.get<CustomerRepositoryFactory>(customerSymbols.customerRepositoryFactory);
    userRepositoryFactory = container.get<UserRepositoryFactory>(userSymbols.userRepositoryFactory);
    bookRepositoryFactory = container.get<BookRepositoryFactory>(bookSymbols.bookRepositoryFactory);
    inventoryRepositoryFactory = container.get<InventoryRepositoryFactory>(inventorySymbols.inventoryRepositoryFactory);
    dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('adds line item to a cart', async () => {
    expect.assertions(7);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const entityManager = unitOfWork.getEntityManager();

      const userRepository = userRepositoryFactory.create(entityManager);

      const cartRepository = cartRepositoryFactory.create(entityManager);

      const bookRepository = bookRepositoryFactory.create(entityManager);

      const customerRepository = customerRepositoryFactory.create(entityManager);

      const inventoryRepository = inventoryRepositoryFactory.create(entityManager);

      const { id: userId, email, password } = userEntityTestFactory.create();

      const { id: customerId } = customerEntityTestFactory.create();

      const { id: cartId } = cartEntityTestFactory.create();

      const { id: inventoryId, quantity } = inventoryEntityTestFactory.create({ quantity: 10 });

      const {
        id: bookId,
        price: bookPrice,
        format,
        isbn,
        language,
        releaseYear,
        title,
      } = bookEntityTestFactory.create();

      const user = await userRepository.createUser({ id: userId, email: email as string, password });

      const customer = await customerRepository.createCustomer({ id: customerId, userId: user.id });

      const book = await bookRepository.createBook({
        id: bookId,
        price: bookPrice,
        format,
        isbn,
        language,
        releaseYear,
        title,
      });

      await inventoryRepository.createInventory({
        id: inventoryId,
        quantity,
        bookId,
      });

      const cart = await cartRepository.createCart({
        id: cartId,
        customerId: customer.id,
        status: CartStatus.active,
        totalPrice: 0,
      });

      const { cart: updatedCart } = await addLineItemCommandHandler.execute({
        unitOfWork,
        cartId: cart.id,
        draft: { bookId: book.id, quantity: 2 },
      });

      const lineItems = updatedCart.lineItems as LineItem[];

      expect(updatedCart.totalPrice).toEqual(2 * bookPrice);
      expect(lineItems.length).toEqual(1);
      expect(lineItems[0]?.bookId).toEqual(bookId);
      expect(lineItems[0]?.cartId).toEqual(cartId);
      expect(lineItems[0]?.price).toEqual(bookPrice);
      expect(lineItems[0]?.totalPrice).toEqual(2 * bookPrice);
      expect(lineItems[0]?.quantity).toEqual(2);
    });
  });

  it('should throw if cart with given id does not exist', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const { id: cartId } = cartEntityTestFactory.create();

      const { id: bookId } = bookEntityTestFactory.create();

      try {
        await addLineItemCommandHandler.execute({
          unitOfWork,
          cartId,
          draft: { bookId, quantity: 1 },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(CartNotFoundError);
      }
    });
  });
});
