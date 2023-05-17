import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { CreateBookCommandHandler } from './createBookCommandHandler';
import { TestTransactionInternalRunner } from '../../../../../../common/tests/testTransactionInternalRunner';
import { postgresModuleSymbols } from '../../../../../../libs/postgres/postgresModuleSymbols';
import { Application } from '../../../../../application';
import { symbols } from '../../../symbols';
import { BookEntityTestFactory } from '../../../tests/factories/bookEntityTestFactory/bookEntityTestFactory';
import { BookRepositoryFactory } from '../../repositories/bookRepository/bookRepositoryFactory';

describe('CreateBookCommandHandler', () => {
  let createBookCommandHandler: CreateBookCommandHandler;
  let bookRepositoryFactory: BookRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

  const bookEntityTestFactory = new BookEntityTestFactory();

  beforeAll(async () => {
    const container = Application.createContainer();

    createBookCommandHandler = container.get<CreateBookCommandHandler>(symbols.createBookCommandHandler);
    bookRepositoryFactory = container.get<BookRepositoryFactory>(symbols.bookRepositoryFactory);
    dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('creates a book in database', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const entityManager = unitOfWork.getEntityManager();

      const bookRepository = bookRepositoryFactory.create(entityManager);

      const { title, isbn, releaseYear, language, format, price } = bookEntityTestFactory.create();

      const { book } = await createBookCommandHandler.execute({
        unitOfWork,
        draft: {
          title,
          isbn,
          releaseYear,
          language,
          format,
          price,
        },
      });

      const foundBook = await bookRepository.findBook({ id: book.id });

      expect(foundBook).not.toBeNull();
    });
  });
});
