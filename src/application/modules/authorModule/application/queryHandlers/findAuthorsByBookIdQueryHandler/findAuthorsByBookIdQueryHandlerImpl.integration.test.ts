import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { FindAuthorsByBookIdQueryHandler } from './findAuthorsByBookIdQueryHandler';
import { TestTransactionInternalRunner } from '../../../../../../common/tests/testTransactionInternalRunner';
import { EqualFilter } from '../../../../../../common/types/filter';
import { FilterName } from '../../../../../../common/types/filterName';
import { FilterSymbol } from '../../../../../../common/types/filterSymbol';
import { postgresModuleSymbols } from '../../../../../../libs/postgres/postgresModuleSymbols';
import { Application } from '../../../../../application';
import { AuthorBookRepositoryFactory } from '../../../../authorBookModule/application/repositories/authorBookRepository/authorBookRepositoryFactory';
import { authorBookSymbols } from '../../../../authorBookModule/symbols';
import { AuthorBookEntityTestFactory } from '../../../../authorBookModule/tests/factories/authorBookEntityTestFactory/authorBookEntityTestFactory';
import { BookRepositoryFactory } from '../../../../bookModule/application/repositories/bookRepository/bookRepositoryFactory';
import { bookSymbols } from '../../../../bookModule/symbols';
import { BookEntityTestFactory } from '../../../../bookModule/tests/factories/bookEntityTestFactory/bookEntityTestFactory';
import { symbols } from '../../../symbols';
import { AuthorEntityTestFactory } from '../../../tests/factories/authorEntityTestFactory/authorEntityTestFactory';
import { AuthorRepositoryFactory } from '../../repositories/authorRepository/authorRepositoryFactory';

describe('FindAuthorsByBookIdQueryHandler', () => {
  let findAuthorsByBookIdQueryHandler: FindAuthorsByBookIdQueryHandler;
  let authorRepositoryFactory: AuthorRepositoryFactory;
  let bookRepositoryFactory: BookRepositoryFactory;
  let authorBookRepositoryFactory: AuthorBookRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

  const authorEntityTestFactory = new AuthorEntityTestFactory();
  const bookEntityTestFactory = new BookEntityTestFactory();
  const authorBookEntityTestFactory = new AuthorBookEntityTestFactory();

  beforeAll(async () => {
    const container = Application.createContainer();

    findAuthorsByBookIdQueryHandler = container.get<FindAuthorsByBookIdQueryHandler>(
      symbols.findAuthorsByBookIdQueryHandler,
    );
    authorRepositoryFactory = container.get<AuthorRepositoryFactory>(symbols.authorRepositoryFactory);
    bookRepositoryFactory = container.get<BookRepositoryFactory>(bookSymbols.bookRepositoryFactory);
    authorBookRepositoryFactory = container.get<AuthorBookRepositoryFactory>(
      authorBookSymbols.authorBookRepositoryFactory,
    );
    dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('finds authors by book id with filtering in database', async () => {
    expect.assertions(3);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const entityManager = unitOfWork.getEntityManager();

      const authorRepository = authorRepositoryFactory.create(entityManager);

      const bookRepository = bookRepositoryFactory.create(entityManager);

      const authorBookRepository = authorBookRepositoryFactory.create(entityManager);

      const { id: bookId, title, isbn, releaseYear, language, format, price } = bookEntityTestFactory.create();

      const { id: authorId1, firstName: firstName1, lastName: lastName1 } = authorEntityTestFactory.create();

      const { id: authorId2, firstName: firstName2, lastName: lastName2 } = authorEntityTestFactory.create();

      const { id: authorId3, firstName: firstName3, lastName: lastName3 } = authorEntityTestFactory.create();

      const { id: authorBookId1 } = authorBookEntityTestFactory.create();

      const { id: authorBookId2 } = authorBookEntityTestFactory.create();

      const book = await bookRepository.createBook({
        id: bookId,
        title,
        isbn,
        releaseYear,
        language,
        format,
        price,
      });

      const author1 = await authorRepository.createAuthor({
        id: authorId1,
        firstName: firstName1,
        lastName: lastName1,
      });

      const author2 = await authorRepository.createAuthor({
        id: authorId2,
        firstName: firstName2,
        lastName: lastName2,
      });

      await authorRepository.createAuthor({
        id: authorId3,
        firstName: firstName3,
        lastName: lastName3,
      });

      await authorBookRepository.createAuthorBook({ id: authorBookId1, bookId: book.id, authorId: author1.id });

      await authorBookRepository.createAuthorBook({ id: authorBookId2, bookId: book.id, authorId: author2.id });

      const equalFilterForFirstNameField: EqualFilter = {
        fieldName: 'firstName',
        filterName: FilterName.equal,
        filterSymbol: FilterSymbol.equal,
        values: [firstName1],
      };

      const { authors: foundAuthors } = await findAuthorsByBookIdQueryHandler.execute({
        unitOfWork,
        bookId: book.id,
        filters: [equalFilterForFirstNameField],
        pagination: { page: 1, limit: 5 },
      });

      expect(foundAuthors.length).toBe(1);
      expect(foundAuthors[0]?.firstName).toBe(author1.firstName);
      expect(foundAuthors[0]?.lastName).toBe(author1.lastName);
    });
  });
});
