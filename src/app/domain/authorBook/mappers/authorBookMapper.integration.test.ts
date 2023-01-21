import { AuthorBookEntity } from '../contracts/authorBookEntity';
import { AuthorBookMapper } from './authorBookMapper';
import { ConfigLoader } from '../../../../configLoader';
import { createDependencyInjectionContainer, postgresConnector, UnitOfWorkModule } from '../../../common';
import { PostgresModule } from '../../../common';
import { AuthorBookModule } from '../authorBookModule';
import { AuthorModule } from '../../author/authorModule';
import { TestTransactionInternalRunner } from '../../../../integration/helpers/unitOfWorkHelper/testTransactionInternalRunner';
import { AuthorTestDataGenerator } from '../../author/testDataGenerators/authorTestDataGenerator';
import { BookTestDataGenerator } from '../../book/tests/bookEntityTestDataGenerator/bookEntityTestDataGenerator';
import { AuthorEntity } from '../../author/contracts/authorEntity';
import { Book } from '../../book/entities/book';
import { LoggerModule } from '../../../common/logger/loggerModule';
import { AUTHOR_BOOK_MAPPER } from '../authorBookSymbols';

describe('AuthorBookMapper', () => {
  let authorBookMapper: AuthorBookMapper;
  let authorTestDataGenerator: AuthorTestDataGenerator;
  let bookTestDataGenerator: BookTestDataGenerator;
  let testTransactionRunner: TestTransactionInternalRunner;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDependencyInjectionContainer([
      PostgresModule,
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
    postgresConnector.closeConnection();
  });

  describe('Map authorBook', () => {
    it('map authorBook from entity to dto', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const { firstName, lastName } = authorTestDataGenerator.generateData();

        const createdAuthor = entityManager.create(AuthorEntity, {
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

        const createdAuthorBook = entityManager.create(AuthorBookEntity, {
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
