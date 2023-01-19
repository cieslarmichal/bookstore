import { ConfigLoader } from '../../../../../../configLoader';
import { postgresConnector } from '../../../../../libs/postgres/postgresConnector';
import { PostgresModule } from '../../../../../libs/postgres/postgresModule';
import { createDependencyInjectionContainer } from '../../../../../libs/dependencyInjection/container';
import { LoggerModule } from '../../../../../libs/logger/loggerModule';
import { UnitOfWorkModule } from '../../../../../libs/unitOfWork/unitOfWorkModule';
import { TestTransactionInternalRunner } from '../../../../../tests/helpers';
import { AuthorModule } from '../../../../author/authorModule';
import { AuthorEntity } from '../../../../author/contracts/authorEntity';
import { Book } from '../../../../book/entities/book';
import { BookTestDataGenerator } from '../../../../book/tests/bookEntityTestDataGenerator/bookEntityTestDataGenerator';
import { AuthorBookModule } from '../../../authorBookModule';
import { AuthorBook } from '../../../contracts/authorBook';
import { AuthorBookMapper } from '../../../contracts/mappers/authorBookMapper/authorBookMapper';

describe('AuthorBookMapperImpl', () => {
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
