import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { CreateAuthorBookCommandHandler } from './createAuthorBookCommandHandler';
import { TestTransactionInternalRunner } from '../../../../../../common/tests/testTransactionInternalRunner';
import { postgresModuleSymbols } from '../../../../../../libs/postgres/postgresModuleSymbols';
import { Application } from '../../../../../application';
import { AuthorRepositoryFactory } from '../../../../authorModule/application/repositories/authorRepository/authorRepositoryFactory';
import { authorModuleSymbols } from '../../../../authorModule/symbols';
import { AuthorEntityTestFactory } from '../../../../authorModule/tests/factories/authorEntityTestFactory/authorEntityTestFactory';
import { BookRepositoryFactory } from '../../../../bookModule/application/repositories/bookRepository/bookRepositoryFactory';
import { bookSymbols } from '../../../../bookModule/symbols';
import { BookEntityTestFactory } from '../../../../bookModule/tests/factories/bookEntityTestFactory/bookEntityTestFactory';
import { AuthorBookAlreadyExistsError } from '../../errors/authorBookAlreadyExistsError';
import { symbols } from '../../../symbols';
import { AuthorBookRepositoryFactory } from '../../repositories/authorBookRepository/authorBookRepositoryFactory';

describe('CreateAuthorBookCommandHandler', () => {
  let createAuthorBookCommandHandler: CreateAuthorBookCommandHandler;
  let authorBookRepositoryFactory: AuthorBookRepositoryFactory;
  let authorRepositoryFactory: AuthorRepositoryFactory;
  let bookRepositoryFactory: BookRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

  const authorEntityTestFactory = new AuthorEntityTestFactory();
  const bookEntityTestFactory = new BookEntityTestFactory();

  beforeAll(async () => {
    const container = Application.createContainer();

    createAuthorBookCommandHandler = container.get<CreateAuthorBookCommandHandler>(
      symbols.createAuthorBookCommandHandler,
    );
    authorBookRepositoryFactory = container.get<AuthorBookRepositoryFactory>(symbols.authorBookRepositoryFactory);
    authorRepositoryFactory = container.get<AuthorRepositoryFactory>(authorModuleSymbols.authorRepositoryFactory);
    bookRepositoryFactory = container.get<BookRepositoryFactory>(bookSymbols.bookRepositoryFactory);
    dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('creates authorBook in database', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const entityManager = unitOfWork.getEntityManager();

      const authorRepository = authorRepositoryFactory.create(entityManager);

      const bookRepository = bookRepositoryFactory.create(entityManager);

      const authorBookRepository = authorBookRepositoryFactory.create(entityManager);

      const authorEntity = authorEntityTestFactory.create();

      const bookEntity = bookEntityTestFactory.create();

      const author = await authorRepository.createAuthor({
        id: authorEntity.id,
        firstName: authorEntity.firstName,
        lastName: authorEntity.lastName,
      });

      const book = await bookRepository.createBook({
        id: bookEntity.id,
        format: bookEntity.format,
        language: bookEntity.language,
        price: bookEntity.price,
        title: bookEntity.title,
        isbn: bookEntity.isbn,
        releaseYear: bookEntity.releaseYear,
      });

      const { authorBook } = await createAuthorBookCommandHandler.execute({
        unitOfWork,
        draft: {
          authorId: author.id,
          bookId: book.id,
        },
      });

      const foundAuthorBook = await authorBookRepository.findAuthorBook({ id: authorBook.id });

      expect(foundAuthorBook).not.toBeNull();
    });
  });

  it('should not create authorBook and throw if authorBook with the authorId and bookId exists', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const entityManager = unitOfWork.getEntityManager();

      const authorRepository = authorRepositoryFactory.create(entityManager);

      const bookRepository = bookRepositoryFactory.create(entityManager);

      const authorEntity = authorEntityTestFactory.create();

      const bookEntity = bookEntityTestFactory.create();

      const author = await authorRepository.createAuthor({
        id: authorEntity.id,
        firstName: authorEntity.firstName,
        lastName: authorEntity.lastName,
      });

      const book = await bookRepository.createBook({
        id: bookEntity.id,
        format: bookEntity.format,
        language: bookEntity.language,
        price: bookEntity.price,
        title: bookEntity.title,
        isbn: bookEntity.isbn,
        releaseYear: bookEntity.releaseYear,
      });

      await createAuthorBookCommandHandler.execute({
        unitOfWork,
        draft: {
          authorId: author.id,
          bookId: book.id,
        },
      });

      try {
        await createAuthorBookCommandHandler.execute({
          unitOfWork,
          draft: {
            authorId: author.id,
            bookId: book.id,
          },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(AuthorBookAlreadyExistsError);
      }
    });
  });
});
