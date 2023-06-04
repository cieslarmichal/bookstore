import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { DeleteAuthorBookCommandHandler } from './deleteAuthorBookCommandHandler';
import { TestTransactionInternalRunner } from '../../../../../../common/tests/testTransactionInternalRunner';
import { postgresModuleSymbols } from '../../../../../../libs/postgres/postgresModuleSymbols';
import { Application } from '../../../../../application';
import { AuthorRepositoryFactory } from '../../../../authorModule/application/repositories/authorRepository/authorRepositoryFactory';
import { authorModuleSymbols } from '../../../../authorModule/symbols';
import { AuthorEntityTestFactory } from '../../../../authorModule/tests/factories/authorEntityTestFactory/authorEntityTestFactory';
import { BookRepositoryFactory } from '../../../../bookModule/application/repositories/bookRepository/bookRepositoryFactory';
import { bookSymbols } from '../../../../bookModule/symbols';
import { BookEntityTestFactory } from '../../../../bookModule/tests/factories/bookEntityTestFactory/bookEntityTestFactory';
import { AuthorBookNotFoundError } from '../../errors/authorBookNotFoundError';
import { authorBookSymbols, symbols } from '../../../symbols';
import { AuthorBookEntityTestFactory } from '../../../tests/factories/authorBookEntityTestFactory/authorBookEntityTestFactory';
import { AuthorBookRepositoryFactory } from '../../repositories/authorBookRepository/authorBookRepositoryFactory';

describe('DeleteAuthorBookCommandHandler', () => {
  let deleteAuthorBookCommandHandler: DeleteAuthorBookCommandHandler;
  let authorBookRepositoryFactory: AuthorBookRepositoryFactory;
  let authorRepositoryFactory: AuthorRepositoryFactory;
  let bookRepositoryFactory: BookRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

  const authorBookEntityTestFactory = new AuthorBookEntityTestFactory();
  const authorEntityTestFactory = new AuthorEntityTestFactory();
  const bookEntityTestFactory = new BookEntityTestFactory();

  beforeAll(async () => {
    const container = Application.createContainer();

    deleteAuthorBookCommandHandler = container.get<DeleteAuthorBookCommandHandler>(
      symbols.deleteAuthorBookCommandHandler,
    );
    authorBookRepositoryFactory = container.get<AuthorBookRepositoryFactory>(
      authorBookSymbols.authorBookRepositoryFactory,
    );
    authorRepositoryFactory = container.get<AuthorRepositoryFactory>(authorModuleSymbols.authorRepositoryFactory);
    bookRepositoryFactory = container.get<BookRepositoryFactory>(bookSymbols.bookRepositoryFactory);
    dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('deletes authorBook from database', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const entityManager = unitOfWork.getEntityManager();

      const authorRepository = authorRepositoryFactory.create(entityManager);

      const bookRepository = bookRepositoryFactory.create(entityManager);

      const authorBookRepository = authorBookRepositoryFactory.create(entityManager);

      const authorEntity = authorEntityTestFactory.create();

      const bookEntity = bookEntityTestFactory.create();

      const { id } = authorBookEntityTestFactory.create();

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

      const authorBook = await authorBookRepository.createAuthorBook({
        id,
        authorId: author.id,
        bookId: book.id,
      });

      await deleteAuthorBookCommandHandler.execute({ unitOfWork, authorId: author.id, bookId: book.id });

      const foundAuthorBook = await authorBookRepository.findAuthorBook({ id: authorBook.id });

      expect(foundAuthorBook).toBeNull();
    });
  });

  it('should throw if authorBook with given id does not exist', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const { authorId, bookId } = authorBookEntityTestFactory.create();

      try {
        await deleteAuthorBookCommandHandler.execute({ unitOfWork, authorId, bookId });
      } catch (error) {
        expect(error).toBeInstanceOf(AuthorBookNotFoundError);
      }
    });
  });
});
