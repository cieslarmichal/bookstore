import { ConfigLoader } from '../../../../../../configLoader';
import { postgresConnector } from '../../../../../libs/postgres/postgresConnector';
import { PostgresModule } from '../../../../../libs/postgres/postgresModule';
import { createDIContainer } from '../../../../../libs/di/container';
import { LoggerModule } from '../../../../../libs/logger/loggerModule';
import { UnitOfWorkModule } from '../../../../../libs/unitOfWork/unitOfWorkModule';
import { TestTransactionInternalRunner } from '../../../../../tests/helpers';
import { AuthorModule } from '../../../../author/authorModule';
import { BookModule } from '../../../bookModule';
import { BookEntity } from '../../../contracts/bookEntity';
import { BookMapper } from '../../../contracts/mappers/bookMapper/bookMapper';
import { BookTestDataGenerator } from '../../../tests/bookEntityTestDataGenerator/bookEntityTestDataGenerator';
import { bookSymbols } from '../../../bookSymbols';

describe('BookMapper', () => {
  let bookMapper: BookMapper;
  let bookTestDataGenerator: BookTestDataGenerator;
  let testTransactionRunner: TestTransactionInternalRunner;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([
      PostgresModule,
      BookModule,
      AuthorModule,
      LoggerModule,
      UnitOfWorkModule,
    ]);

    bookMapper = container.resolve(bookSymbols.bookMapper);

    testTransactionRunner = new TestTransactionInternalRunner(container);

    bookTestDataGenerator = new BookTestDataGenerator();
  });

  afterAll(async () => {
    postgresConnector.closeConnection();
  });

  describe('Map book', () => {
    it('map book from entity to dto', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

        const createdBook = entityManager.create(BookEntity, {
          title,
          releaseYear,
          language,
          format,
          price,
        });

        const savedBook = await entityManager.save(createdBook);

        const bookDto = bookMapper.map(savedBook);

        expect(bookDto).toEqual({
          id: savedBook.id,
          createdAt: savedBook.createdAt,
          updatedAt: savedBook.updatedAt,
          title: savedBook.title,
          releaseYear: savedBook.releaseYear,
          language: savedBook.language,
          format: savedBook.format,
          description: null,
          price: savedBook.price,
        });
      });
    });

    it('maps a book with optional field from entity to dto', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const { title, releaseYear, language, format, description, price } = bookTestDataGenerator.generateData();

        const createdBook = entityManager.create(BookEntity, {
          title,
          releaseYear,
          language,
          format,
          description: description as string,
          price,
        });

        const savedBook = await entityManager.save(createdBook);

        const bookDto = bookMapper.map(savedBook);

        expect(bookDto).toEqual({
          id: savedBook.id,
          createdAt: savedBook.createdAt,
          updatedAt: savedBook.updatedAt,
          title: savedBook.title,
          releaseYear: savedBook.releaseYear,
          language: savedBook.language,
          format: savedBook.format,
          description: savedBook.description,
          price: savedBook.price,
        });
      });
    });
  });
});
