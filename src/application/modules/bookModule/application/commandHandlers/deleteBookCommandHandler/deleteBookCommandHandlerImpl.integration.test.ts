import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { DeleteBookCommandHandler } from './deleteBookCommandHandler';
import { TestTransactionInternalRunner } from '../../../../../../common/tests/testTransactionInternalRunner';
import { postgresModuleSymbols } from '../../../../../../libs/postgres/postgresModuleSymbols';
import { Application } from '../../../../../application';
import { symbols } from '../../../symbols';
import { BookEntityTestFactory } from '../../../tests/factories/bookEntityTestFactory/bookEntityTestFactory';
import { BookNotFoundError } from '../../errors/bookNotFoundError';
import { BookRepositoryFactory } from '../../repositories/bookRepository/bookRepositoryFactory';

describe('DeleteBookCommandHandler', () => {
  let deleteBookCommandHandler: DeleteBookCommandHandler;
  let bookRepositoryFactory: BookRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

  const bookEntityTestFactory = new BookEntityTestFactory();

  beforeAll(async () => {
    const container = Application.createContainer();

    deleteBookCommandHandler = container.get<DeleteBookCommandHandler>(symbols.deleteBookCommandHandler);
    bookRepositoryFactory = container.get<BookRepositoryFactory>(symbols.bookRepositoryFactory);
    dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('deletes book from database', async () => {
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

      await deleteBookCommandHandler.execute({ unitOfWork, bookId: book.id });

      const foundBook = await bookRepository.findBook({ id: book.id });

      expect(foundBook).toBeNull();
    });
  });

  it('should throw if book with given id does not exist', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const { id } = bookEntityTestFactory.create();

      try {
        await deleteBookCommandHandler.execute({ unitOfWork, bookId: id });
      } catch (error) {
        expect(error).toBeInstanceOf(BookNotFoundError);
      }
    });
  });
});
