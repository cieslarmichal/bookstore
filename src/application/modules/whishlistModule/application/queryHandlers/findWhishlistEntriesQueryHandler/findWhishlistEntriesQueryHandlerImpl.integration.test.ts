import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { FindWhishlistEntriesQueryHandler } from './findWhishlistEntriesQueryHandler';
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
import { symbols } from '../../../symbols';
import { WhishlistEntryEntityTestFactory } from '../../../tests/factories/whishlistEntryEntityTestFactory/whishlistEntryEntityTestFactory';
import { WhishlistEntryRepositoryFactory } from '../../repositories/whishlistEntryRepository/whishlistEntryRepositoryFactory';

describe('FindWhishlistEntriesQueryHandler', () => {
  let findWhishlistEntriesQueryHandler: FindWhishlistEntriesQueryHandler;
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

    findWhishlistEntriesQueryHandler = container.get<FindWhishlistEntriesQueryHandler>(
      symbols.findWhishlistEntriesQueryHandler,
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

  it('finds whishlist entries by customer id', async () => {
    expect.assertions(2);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const entityManager = unitOfWork.getEntityManager();

      const whishlistEntryRepository = whishlistEntryRepositoryFactory.create(entityManager);

      const userRepository = userRepositoryFactory.create(entityManager);

      const customerRepository = customerRepositoryFactory.create(entityManager);

      const bookRepository = bookRepositoryFactory.create(entityManager);

      const { id: whishlistEntryId1 } = whishlistEntryEntityTestFactory.create();

      const { id: whishlistEntryId2 } = whishlistEntryEntityTestFactory.create();

      const { id: userId1, email: email1, password } = userEntityTestFactory.create();

      const { id: userId2, email: email2 } = userEntityTestFactory.create();

      const { id: customerId1 } = customerEntityTestFactory.create();

      const { id: customerId2 } = customerEntityTestFactory.create();

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

      const user1 = await userRepository.createUser({ id: userId1, email: email1 as string, password });

      const user2 = await userRepository.createUser({ id: userId2, email: email2 as string, password });

      const customer1 = await customerRepository.createCustomer({ id: customerId1, userId: user1.id });

      const customer2 = await customerRepository.createCustomer({ id: customerId2, userId: user2.id });

      const whishlistEntry = await whishlistEntryRepository.createWhishlistEntry({
        id: whishlistEntryId1,
        bookId: book.id,
        customerId: customer1.id,
      });

      await whishlistEntryRepository.createWhishlistEntry({
        id: whishlistEntryId2,
        bookId: book.id,
        customerId: customer2.id,
      });

      const { whishlistEntries: foundWhishlistEntries } = await findWhishlistEntriesQueryHandler.execute({
        unitOfWork,
        customerId: customer1.id,
        pagination: {
          page: 1,
          limit: 5,
        },
      });

      expect(foundWhishlistEntries.length).toBe(1);
      expect(foundWhishlistEntries[0]).toStrictEqual(whishlistEntry);
    });
  });
});
