import 'reflect-metadata';
import { EntityManager, getConnection } from 'typeorm';
import { Book } from '../entities/book';
import { BookMapper } from './bookMapper';
import { BookTestDataGenerator } from '../testDataGenerators/bookTestDataGenerator';
import { ConfigLoader } from '../../../config';
import { createDIContainer } from '../../../shared';
import { DbModule } from '../../../shared';
import { BookModule } from '../bookModule';
import { ControllersModule } from '../../../controllers/controllersModule';

describe('BookMapper', () => {
  let bookMapper: BookMapper;
  let bookTestDataGenerator: BookTestDataGenerator;
  let entityManager: EntityManager;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([DbModule, BookModule, ControllersModule]);

    bookMapper = container.resolve('bookMapper');
    entityManager = container.resolve('entityManager');

    bookTestDataGenerator = new BookTestDataGenerator();
  });

  afterAll(async () => {
    await getConnection().close();
  });

  afterEach(async () => {
    const entities = getConnection().entityMetadatas;
    for (const entity of entities) {
      const repository = await getConnection().getRepository(entity.name);
      await repository.query(`TRUNCATE ${entity.tableName} RESTART IDENTITY CASCADE;`);
    }
  });

  describe('Map book', () => {
    it('map book from entity to dto', async () => {
      expect.assertions(1);

      const { title, author, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const createdBook = entityManager.create(Book, {
        title,
        author,
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
        author: savedBook.author,
        releaseYear: savedBook.releaseYear,
        language: savedBook.language,
        format: savedBook.format,
        description: null,
        price: savedBook.price,
      });
    });

    it('maps a book with optional field from entity to dto', async () => {
      expect.assertions(1);

      const { title, author, releaseYear, language, format, description, price } = bookTestDataGenerator.generateData();

      const createdBook = entityManager.create(Book, {
        title,
        author,
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
        author: savedBook.author,
        releaseYear: savedBook.releaseYear,
        language: savedBook.language,
        format: savedBook.format,
        description: savedBook.description,
        price: savedBook.price,
      });
    });
  });
});
