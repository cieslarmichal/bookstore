import { Book } from '../entities/book';
import { BookMapper } from './bookMapper';
import { BookTestDataGenerator } from '../testDataGenerators/bookTestDataGenerator';
import { ConfigLoader } from '../../../../configLoader';
import { createDIContainer, UnitOfWorkModule } from '../../../shared';
import { DbModule } from '../../../shared';
import { BookModule } from '../bookModule';
import { AuthorModule } from '../../author/authorModule';
import { PostgresHelper } from '../../../../integration/helpers/postgresHelper/postgresHelper';
import { LoggerModule } from '../../../shared/logger/loggerModule';
import { BOOK_MAPPER } from '../bookInjectionSymbols';

describe('BookMapper', () => {
  let bookMapper: BookMapper;
  let bookTestDataGenerator: BookTestDataGenerator;
  let postgresHelper: PostgresHelper;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([DbModule, BookModule, AuthorModule, LoggerModule, UnitOfWorkModule]);

    bookMapper = container.resolve(BOOK_MAPPER);

    postgresHelper = new PostgresHelper(container);

    bookTestDataGenerator = new BookTestDataGenerator();
  });

  describe('Map book', () => {
    it('map book from entity to dto', async () => {
      expect.assertions(1);

      await postgresHelper.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

        const createdBook = entityManager.create(Book, {
          title,
          releaseYear,
          language,
          format,
          price,
        });

        const savedBook = await entityManager.save(createdBook);

        const bookDto = bookMapper.mapEntityToDto(savedBook);

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

      await postgresHelper.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const { title, releaseYear, language, format, description, price } = bookTestDataGenerator.generateData();

        const createdBook = entityManager.create(Book, {
          title,
          releaseYear,
          language,
          format,
          description: description as string,
          price,
        });

        const savedBook = await entityManager.save(createdBook);

        const bookDto = bookMapper.mapEntityToDto(savedBook);

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
