import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { RemoveLineItemCommandHandler } from './removeLineItemCommandHandler';
import { TestTransactionInternalRunner } from '../../../../../../common/tests/testTransactionInternalRunner';
import { postgresModuleSymbols } from '../../../../../../libs/postgres/postgresModuleSymbols';
import { Application } from '../../../../../application';
import { BookRepositoryFactory } from '../../../../bookModule/application/repositories/bookRepository/bookRepositoryFactory';
import { bookSymbols } from '../../../../bookModule/symbols';
import { BookEntityTestFactory } from '../../../../bookModule/tests/factories/bookEntityTestFactory/bookEntityTestFactory';
import { CustomerRepositoryFactory } from '../../../../customerModule/application/repositories/customerRepository/customerRepositoryFactory';
import { customerSymbols } from '../../../../customerModule/symbols';
import { CustomerEntityTestFactory } from '../../../../customerModule/tests/factories/customerEntityTestFactory/customerEntityTestFactory';
import { UserRepositoryFactory } from '../../../../userModule/application/repositories/userRepository/userRepositoryFactory';
import { UserEntityTestFactory } from '../../../../userModule/tests/factories/userEntityTestFactory/userEntityTestFactory';
import { userSymbols } from '../../../../userModule/symbols';
import { CartStatus } from '../../../domain/entities/cart/cartStatus';
import { LineItem } from '../../../domain/entities/lineItem/lineItem';
import { CartNotFoundError } from '../../errors/cartNotFoundError';
import { LineItemNotFoundError } from '../../errors/lineItemNotFoundError';
import { symbols } from '../../../symbols';
import { CartEntityTestFactory } from '../../../tests/factories/cartEntityTestFactory/cartEntityTestFactory';
import { LineItemEntityTestFactory } from '../../../tests/factories/lineItemEntityTestFactory/lineItemEntityTestFactory';
import { CartRepositoryFactory } from '../../repositories/cartRepository/cartRepositoryFactory';
import { LineItemRepositoryFactory } from '../../repositories/lineItemRepository/lineItemRepositoryFactory';

describe('RemoveLineItemCommandHandler', () => {
  let removeLineItemCommandHandler: RemoveLineItemCommandHandler;
  let cartRepositoryFactory: CartRepositoryFactory;
  let userRepositoryFactory: UserRepositoryFactory;
  let customerRepositoryFactory: CustomerRepositoryFactory;
  let bookRepositoryFactory: BookRepositoryFactory;
  let lineItemRepositoryFactory: LineItemRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

  const cartEntityTestFactory = new CartEntityTestFactory();
  const userEntityTestFactory = new UserEntityTestFactory();
  const customerEntityTestFactory = new CustomerEntityTestFactory();
  const bookEntityTestFactory = new BookEntityTestFactory();
  const lineItemEntityTestFactory = new LineItemEntityTestFactory();

  beforeAll(async () => {
    const container = Application.createContainer();

    removeLineItemCommandHandler = container.get<RemoveLineItemCommandHandler>(symbols.removeLineItemCommandHandler);
    cartRepositoryFactory = container.get<CartRepositoryFactory>(symbols.cartRepositoryFactory);
    customerRepositoryFactory = container.get<CustomerRepositoryFactory>(customerSymbols.customerRepositoryFactory);
    userRepositoryFactory = container.get<UserRepositoryFactory>(userSymbols.userRepositoryFactory);
    bookRepositoryFactory = container.get<BookRepositoryFactory>(bookSymbols.bookRepositoryFactory);
    lineItemRepositoryFactory = container.get<LineItemRepositoryFactory>(symbols.lineItemRepositoryFactory);
    dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('Remove line item', () => {
    it('should descrease line item quantity if quantity to remove is less than total line item quantity', async () => {
      expect.assertions(7);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const cartRepository = cartRepositoryFactory.create(entityManager);

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const lineItemRepository = lineItemRepositoryFactory.create(entityManager);

        const { id: userId, email, password } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const { id: cartId } = cartEntityTestFactory.create();

        const {
          id: bookId,
          price: bookPrice,
          format,
          isbn,
          language,
          releaseYear,
          title,
        } = bookEntityTestFactory.create();

        const {
          id: lineItemId,
          price,
          totalPrice,
          quantity,
        } = lineItemEntityTestFactory.create({ quantity: 2, price: bookPrice });

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

        const cart = await cartRepository.createCart({
          id: cartId,
          customerId: customer.id,
          status: CartStatus.active,
          totalPrice,
        });

        const lineItem = await lineItemRepository.createLineItem({
          id: lineItemId,
          price,
          quantity,
          totalPrice,
          cartId: cart.id,
          bookId: book.id,
        });

        const { cart: updatedCart } = await removeLineItemCommandHandler.execute({
          unitOfWork,
          cartId: cart.id,
          draft: { lineItemId: lineItem.id, quantity: 1 },
        });

        const lineItems = updatedCart.lineItems as LineItem[];

        expect(updatedCart.totalPrice).toEqual(bookPrice);
        expect(lineItems.length).toEqual(1);
        expect(lineItems[0]?.bookId).toEqual(bookId);
        expect(lineItems[0]?.cartId).toEqual(cartId);
        expect(lineItems[0]?.price).toEqual(bookPrice);
        expect(lineItems[0]?.totalPrice).toEqual(bookPrice);
        expect(lineItems[0]?.quantity).toEqual(1);
      });
    });

    it('should remove line item from a cart if quantity to remove is greater of equal than total line item quantity', async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const cartRepository = cartRepositoryFactory.create(entityManager);

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const lineItemRepository = lineItemRepositoryFactory.create(entityManager);

        const { id: userId, email, password } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const { id: cartId } = cartEntityTestFactory.create();

        const {
          id: bookId,
          price: bookPrice,
          format,
          isbn,
          language,
          releaseYear,
          title,
        } = bookEntityTestFactory.create();

        const {
          id: lineItemId,
          price,
          totalPrice,
          quantity,
        } = lineItemEntityTestFactory.create({ quantity: 2, price: bookPrice });

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

        const cart = await cartRepository.createCart({
          id: cartId,
          customerId: customer.id,
          status: CartStatus.active,
          totalPrice,
        });

        const lineItem = await lineItemRepository.createLineItem({
          id: lineItemId,
          price,
          quantity,
          totalPrice,
          cartId: cart.id,
          bookId: book.id,
        });

        const { cart: updatedCart } = await removeLineItemCommandHandler.execute({
          unitOfWork,
          cartId: cart.id,
          draft: { lineItemId: lineItem.id, quantity: 3 },
        });

        const lineItems = updatedCart.lineItems as LineItem[];

        expect(updatedCart.totalPrice).toEqual(0);
        expect(lineItems.length).toEqual(0);
      });
    });

    it('should throw if cart with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { id: cartId } = cartEntityTestFactory.create();

        const { id: lineItemId } = lineItemEntityTestFactory.create();

        try {
          await removeLineItemCommandHandler.execute({
            unitOfWork,
            cartId,
            draft: { lineItemId, quantity: 1 },
          });
        } catch (error) {
          expect(error).toBeInstanceOf(CartNotFoundError);
        }
      });
    });
  });

  it('should throw if line item with given id does not exist', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const entityManager = unitOfWork.getEntityManager();

      const userRepository = userRepositoryFactory.create(entityManager);

      const cartRepository = cartRepositoryFactory.create(entityManager);

      const customerRepository = customerRepositoryFactory.create(entityManager);

      const { id: userId, email, password } = userEntityTestFactory.create();

      const { id: customerId } = customerEntityTestFactory.create();

      const { id: cartId } = cartEntityTestFactory.create();

      const { id: lineItemId } = lineItemEntityTestFactory.create();

      const user = await userRepository.createUser({ id: userId, email: email as string, password });

      const customer = await customerRepository.createCustomer({ id: customerId, userId: user.id });

      await cartRepository.createCart({
        id: cartId,
        customerId: customer.id,
        status: CartStatus.active,
        totalPrice: 0,
      });

      try {
        await removeLineItemCommandHandler.execute({
          unitOfWork,
          cartId,
          draft: { lineItemId, quantity: 1 },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(LineItemNotFoundError);
      }
    });
  });
});
