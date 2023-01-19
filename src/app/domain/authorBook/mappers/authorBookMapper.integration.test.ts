import { AuthorBook } from '../entities/authorBook';
import { AuthorBookMapper } from './authorBookMapper';
import { ConfigLoader } from '../../../../configLoader';
import { createDIContainer, dbManager, UnitOfWorkModule } from '../../../common';
import { DbModule } from '../../../common';
import { AuthorBookModule } from '../authorBookModule';
import { AuthorModule } from '../../author/authorModule';
import { TestTransactionInternalRunner } from '../../../../integration/helpers/unitOfWorkHelper/testTransactionInternalRunner';
import { AuthorTestDataGenerator } from '../../author/testDataGenerators/authorTestDataGenerator';
import { BookTestDataGenerator } from '../../book/testDataGenerators/bookTestDataGenerator';
import { Author } from '../../author/entities/author';
import { Book } from '../../book/entities/book';
import { LoggerModule } from '../../../common/logger/loggerModule';
import { AUTHOR_BOOK_MAPPER } from '../authorBookInjectionSymbols';

describe('AuthorBookMapper', () => {
  let authorBookMapper: AuthorBookMapper;
  let authorTestDataGenerator: AuthorTestDataGenerator;
  let bookTestDataGenerator: BookTestDataGenerator;
  let testTransactionRunner: TestTransactionInternalRunner;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([
      DbModule,
      AuthorBookModule,
      AuthorModule,
      LoggerModule,
      UnitOfWorkModule,
    ]);

    authorBookMapper = container.resolve(AUTHOR_BOOK_MAPPER);

    testTransactionRunner = new TestTransactionInternalRunner(container);

    authorTestDataGenerator = new AuthorTestDataGenerator();
    bookTestDataGenerator = new BookTestDataGenerator();
  });

  afterAll(async () => {
    dbManager.closeConnection();
  });

  describe('Map authorBook', () => {
    it('map authorBook from entity to dto', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const { firstName, lastName } = authorTestDataGenerator.generateData();

        const createdAuthor = entityManager.create(Author, {
          firstName,
          lastName,
        });

        const savedAuthor = await entityManager.save(createdAuthor);

        const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

        const createdBook = entityManager.create(Book, {
          title,
          releaseYear,
          language,
          format,
          price,
        });

        const savedBook = await entityManager.save(createdBook);

        const createdAuthorBook = entityManager.create(AuthorBook, {
          authorId: savedAuthor.id,
          bookId: savedBook.id,
        });

        const savedAuthorBook = await entityManager.save(createdAuthorBook);

        const authorBookDto = authorBookMapper.map(savedAuthorBook);

        expect(authorBookDto).toEqual({
          id: savedAuthorBook.id,
          createdAt: savedAuthorBook.createdAt,
          updatedAt: savedAuthorBook.updatedAt,
          authorId: savedAuthor.id,
          bookId: savedBook.id,
        });
      });
    });
  });
});
