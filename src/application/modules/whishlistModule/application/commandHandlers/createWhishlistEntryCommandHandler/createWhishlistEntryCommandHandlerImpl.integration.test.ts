import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { CreateWhishlistEntryCommandHandler } from './createWhishlistEntryCommandHandler';
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
import { WhishlistEntryAlreadyExistsError } from '../../../infrastructure/errors/whishlistEntryAlreadyExistsError';
import { symbols } from '../../../symbols';
import { WhishlistEntryEntityTestFactory } from '../../../tests/factories/whishlistEntryEntityTestFactory/whishlistEntryEntityTestFactory';
import { WhishlistEntryRepositoryFactory } from '../../repositories/whishlistEntryRepository/whishlistEntryRepositoryFactory';

describe('CreateWhishlistEntryCommandHandler', () => {
  let createWhishlistEntryCommandHandler: CreateWhishlistEntryCommandHandler;
  let whishlistEntryRepositoryFactory: WhishlistEntryRepositoryFactory;
  let customerRepositoryFactory: CustomerRepositoryFactory;
  let userRepositoryFactory: UserRepositoryFactory;
  let bookRepositoryFactory: BookRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

  const whishlistEntryEntityTestFactory = new WhishlistEntryEntityTestFactory();
  const customerEntityTestFactory = new CustomerEntityTestFactory();
  const userEntityTestFactory = new UserEntityTestFactory();
  const bookEntityTestFactory = new BookEntityTestFactory();

  beforeAll(async () => {
    const container = Application.createContainer();

    createWhishlistEntryCommandHandler = container.get<CreateWhishlistEntryCommandHandler>(
      symbols.createWhishlistEntryCommandHandler,
    );
    whishlistEntryRepositoryFactory = container.get<WhishlistEntryRepositoryFactory>(
      symbols.whishlistEntryRepositoryFactory,
    );
    userRepositoryFactory = container.get<UserRepositoryFactory>(userSymbols.userRepositoryFactory);
    customerRepositoryFactory = container.get<CustomerRepositoryFactory>(customerSymbols.customerRepositoryFactory);
    bookRepositoryFactory = container.get<BookRepositoryFactory>(bookSymbols.bookRepositoryFactory);
    dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('creates whishlist entry in database', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const entityManager = unitOfWork.getEntityManager();

      const whishlistEntryRepository = whishlistEntryRepositoryFactory.create(entityManager);

      const userRepository = userRepositoryFactory.create(entityManager);

      const customerRepository = customerRepositoryFactory.create(entityManager);

      const bookRepository = bookRepositoryFactory.create(entityManager);

      const { id: userId, email, password } = userEntityTestFactory.create();

      const { id: customerId } = customerEntityTestFactory.create();

      const bookEntity = bookEntityTestFactory.create();

      const book = await bookRepository.createBook({
        id: bookEntity.id,
        format: bookEntity.format,
        language: bookEntity.language,
        price: bookEntity.price,
        title: bookEntity.title,
        isbn: bookEntity.isbn,
        releaseYear: bookEntity.releaseYear,
      });

      const user = await userRepository.createUser({ id: userId, email: email as string, password });

      const customer = await customerRepository.createCustomer({ id: customerId, userId: user.id });

      const { whishlistEntry } = await createWhishlistEntryCommandHandler.execute({
        unitOfWork,
        draft: {
          bookId: book.id,
          customerId: customer.id,
        },
      });

      const foundWhishlistEntry = await whishlistEntryRepository.findWhishlistEntry({ id: whishlistEntry.id });

      expect(foundWhishlistEntry).not.toBeNull();
    });
  });

  it('throws if whishlist entry with bookId and customerId already exists', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const entityManager = unitOfWork.getEntityManager();

      const whishlistEntryRepository = whishlistEntryRepositoryFactory.create(entityManager);

      const userRepository = userRepositoryFactory.create(entityManager);

      const customerRepository = customerRepositoryFactory.create(entityManager);

      const bookRepository = bookRepositoryFactory.create(entityManager);

      const { id: userId, email, password } = userEntityTestFactory.create();

      const { id: customerId } = customerEntityTestFactory.create();

      const { id: whishlistEntryId } = whishlistEntryEntityTestFactory.create();

      const bookEntity = bookEntityTestFactory.create();

      const book = await bookRepository.createBook({
        id: bookEntity.id,
        format: bookEntity.format,
        language: bookEntity.language,
        price: bookEntity.price,
        title: bookEntity.title,
        isbn: bookEntity.isbn,
        releaseYear: bookEntity.releaseYear,
      });

      const user = await userRepository.createUser({ id: userId, email: email as string, password });

      const customer = await customerRepository.createCustomer({ id: customerId, userId: user.id });

      await whishlistEntryRepository.createWhishlistEntry({
        id: whishlistEntryId,
        bookId: book.id,
        customerId: customer.id,
      });

      try {
        await createWhishlistEntryCommandHandler.execute({
          unitOfWork,
          draft: {
            bookId: book.id,
            customerId: customer.id,
          },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(WhishlistEntryAlreadyExistsError);
      }
    });
  });
});
