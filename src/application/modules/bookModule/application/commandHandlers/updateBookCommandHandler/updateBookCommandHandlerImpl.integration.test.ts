import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { UpdateBookCommandHandler } from './updateBookCommandHandler';
import { TestTransactionInternalRunner } from '../../../../../../common/tests/testTransactionInternalRunner';
import { postgresModuleSymbols } from '../../../../../../libs/postgres/postgresModuleSymbols';
import { Application } from '../../../../../application';
import { symbols } from '../../../symbols';
import { BookEntityTestFactory } from '../../../tests/factories/bookEntityTestFactory/bookEntityTestFactory';
import { BookNotFoundError } from '../../errors/bookNotFoundError';
import { BookRepositoryFactory } from '../../repositories/bookRepository/bookRepositoryFactory';

describe('UpdateBookCommandHandler', () => {
  let updateBookCommandHandler: UpdateBookCommandHandler;
  let bookRepositoryFactory: BookRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

  const bookEntityTestFactory = new BookEntityTestFactory();

  beforeAll(async () => {
    const container = Application.createContainer();

    updateBookCommandHandler = container.get<UpdateBookCommandHandler>(symbols.updateBookCommandHandler);
    bookRepositoryFactory = container.get<BookRepositoryFactory>(symbols.bookRepositoryFactory);
    dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('updates book in database', async () => {
    expect.assertions(2);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const entityManager = unitOfWork.getEntityManager();

      const bookRepository = bookRepositoryFactory.create(entityManager);

      const { id, title, isbn, releaseYear, language, format, price } = bookEntityTestFactory.create();

      const newPrice = price + 1;

      const book = await bookRepository.createBook({
        id,
        title,
        isbn,
        releaseYear,
        language,
        format,
        price,
      });

      const { book: updatedBook } = await updateBookCommandHandler.execute({
        unitOfWork,
        bookId: book.id,
        draft: { price: newPrice },
      });

      expect(updatedBook).not.toBeNull();
      expect(updatedBook.price).toBe(newPrice);
    });
  });

  it('should not update book and throw if book with given id does not exist', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const { id, price } = bookEntityTestFactory.create();

      try {
        await updateBookCommandHandler.execute({ unitOfWork, bookId: id, draft: { price } });
      } catch (error) {
        expect(error).toBeInstanceOf(BookNotFoundError);
      }
    });
  });
});
