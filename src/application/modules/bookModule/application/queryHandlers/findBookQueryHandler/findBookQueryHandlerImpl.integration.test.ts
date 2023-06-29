import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { FindBookQueryHandler } from './findBookQueryHandler';
import { TestTransactionInternalRunner } from '../../../../../../common/tests/testTransactionInternalRunner';
import { postgresModuleSymbols } from '../../../../../../libs/postgres/postgresModuleSymbols';
import { Application } from '../../../../../application';
import { symbols } from '../../../symbols';
import { BookEntityTestFactory } from '../../../tests/factories/bookEntityTestFactory/bookEntityTestFactory';
import { BookNotFoundError } from '../../errors/bookNotFoundError';
import { BookRepositoryFactory } from '../../repositories/bookRepository/bookRepositoryFactory';

describe('FindBookQueryHandler', () => {
  let findBookQueryHandler: FindBookQueryHandler;
  let bookRepositoryFactory: BookRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

  const bookEntityTestFactory = new BookEntityTestFactory();

  beforeAll(async () => {
    const container = Application.createContainer();

    findBookQueryHandler = container.get<FindBookQueryHandler>(symbols.findBookQueryHandler);
    bookRepositoryFactory = container.get<BookRepositoryFactory>(symbols.bookRepositoryFactory);
    dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('finds book by id in database', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const entityManager = unitOfWork.getEntityManager();

      const bookRepository = bookRepositoryFactory.create(entityManager);

      const { id, title, isbn, releaseYear, language, format, price } = bookEntityTestFactory.create();

      const book = await bookRepository.createBook({
        id,
        title,
        isbn,
        releaseYear,
        language,
        format,
        price,
      });

      const foundBook = await findBookQueryHandler.execute({ unitOfWork, bookId: book.id });

      expect(foundBook).not.toBeNull();
    });
  });

  it('should throw if book with given id does not exist in db', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const { id } = bookEntityTestFactory.create();

      try {
        await findBookQueryHandler.execute({ unitOfWork, bookId: id });
      } catch (error) {
        expect(error).toBeInstanceOf(BookNotFoundError);
      }
    });
  });
});
