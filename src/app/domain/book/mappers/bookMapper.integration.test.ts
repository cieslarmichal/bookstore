import { EntityManager } from 'typeorm';
import { Book } from '../entities/book';
import { BookMapper } from './bookMapper';
import { BookTestDataGenerator } from '../testDataGenerators/bookTestDataGenerator';
import { ConfigLoader } from '../../../../configLoader';
import { createDIContainer } from '../../../shared';
import { DbModule } from '../../../shared';
import { BookModule } from '../bookModule';
import { AuthorModule } from '../../author/authorModule';
import { PostgresHelper } from '../../../../integration/helpers/postgresHelper/postgresHelper';
import { LoggerModule } from '../../../shared/logger/loggerModule';
import { BOOK_MAPPER } from '../bookInjectionSymbols';
import { ENTITY_MANAGER } from '../../../shared/db/dbInjectionSymbols';

describe('BookMapper', () => {
  let bookMapper: BookMapper;
  let bookTestDataGenerator: BookTestDataGenerator;
  let entityManager: EntityManager;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([DbModule, BookModule, AuthorModule, LoggerModule]);

    bookMapper = container.resolve(BOOK_MAPPER);
    entityManager = container.resolve(ENTITY_MANAGER);

    bookTestDataGenerator = new BookTestDataGenerator();
  });

  afterEach(async () => {
    await PostgresHelper.removeDataFromTables();
  });

  describe('Map book', () => {
    it('map book from entity to dto', async () => {
      expect.assertions(1);

      const { title, releaseYear, language, format, price, categoryId } = bookTestDataGenerator.generateData();

      const createdBook = entityManager.create(Book, {
        title,
        releaseYear,
        language,
        format,
        price,
        categoryId,
      });

      const savedBook = await entityManager.save(createdBook);

      const bookDto = bookMapper.mapEntityToDto(savedBook);

      expect(bookDto).toEqual({
        id: savedBook.id,
        createdAt: savedBook.createdAt,
        updatedAt: savedBook.updatedAt,
        title: savedBook.title,
        categoryId: savedBook.categoryId,
        releaseYear: savedBook.releaseYear,
        language: savedBook.language,
        format: savedBook.format,
        description: null,
        price: savedBook.price,
      });
    });

    it('maps a book with optional field from entity to dto', async () => {
      expect.assertions(1);

      const { title, releaseYear, language, format, description, price, categoryId } =
        bookTestDataGenerator.generateData();

      const createdBook = entityManager.create(Book, {
        title,
        releaseYear,
        language,
        format,
        description: description as string,
        price,
        categoryId,
      });

      const savedBook = await entityManager.save(createdBook);

      const bookDto = bookMapper.mapEntityToDto(savedBook);

      expect(bookDto).toEqual({
        id: savedBook.id,
        createdAt: savedBook.createdAt,
        updatedAt: savedBook.updatedAt,
        title: savedBook.title,
        categoryId: savedBook.categoryId,
        releaseYear: savedBook.releaseYear,
        language: savedBook.language,
        format: savedBook.format,
        description: savedBook.description,
        price: savedBook.price,
      });
    });
  });
});
