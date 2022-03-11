import { EntityManager } from 'typeorm';
import { Book } from '../entities/book';
import { BookMapper } from './bookMapper';
import { BookTestDataGenerator } from '../testDataGenerators/bookTestDataGenerator';
import { AuthorTestDataGenerator } from '../../author/testDataGenerators/authorTestDataGenerator';
import { ConfigLoader } from '../../../../configLoader';
import { createDIContainer } from '../../../shared';
import { DbModule } from '../../../shared';
import { BookModule } from '../bookModule';
import { Author } from '../../author/entities/author';
import { AuthorModule } from '../../author/authorModule';
import { PostgresHelper } from '../../../../integration/helpers/postgresHelper/postgresHelper';
import { CategoryTestDataGenerator } from '../../category/testDataGenerators/categoryTestDataGenerator';
import { Category } from '../../category/entities/category';

describe('BookMapper', () => {
  let bookMapper: BookMapper;
  let bookTestDataGenerator: BookTestDataGenerator;
  let authorTestDataGenerator: AuthorTestDataGenerator;
  let categoryTestDataGenerator: CategoryTestDataGenerator;
  let entityManager: EntityManager;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([DbModule, BookModule, AuthorModule]);

    bookMapper = container.resolve('bookMapper');
    entityManager = container.resolve('entityManager');

    bookTestDataGenerator = new BookTestDataGenerator();
    authorTestDataGenerator = new AuthorTestDataGenerator();
    categoryTestDataGenerator = new CategoryTestDataGenerator();
  });

  afterEach(async () => {
    await PostgresHelper.removeDataFromTables();
  });

  describe('Map book', () => {
    it('map book from entity to dto', async () => {
      expect.assertions(1);

      const { firstName, lastName } = authorTestDataGenerator.generateData();

      const createdAuthor = entityManager.create(Author, {
        firstName,
        lastName,
      });

      const savedAuthor = await entityManager.save(createdAuthor);

      const { name } = categoryTestDataGenerator.generateData();

      const createdCategory = entityManager.create(Category, {
        name,
      });

      const savedCategory = await entityManager.save(createdCategory);

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const createdBook = entityManager.create(Book, {
        title,
        releaseYear,
        language,
        format,
        price,
        authorId: savedAuthor.id,
        categoryId: savedCategory.id,
      });

      const savedBook = await entityManager.save(createdBook);

      const bookDto = bookMapper.mapEntityToDto(savedBook);

      expect(bookDto).toEqual({
        id: savedBook.id,
        createdAt: savedBook.createdAt,
        updatedAt: savedBook.updatedAt,
        title: savedBook.title,
        authorId: savedAuthor.id,
        categoryId: savedCategory.id,
        releaseYear: savedBook.releaseYear,
        language: savedBook.language,
        format: savedBook.format,
        description: null,
        price: savedBook.price,
      });
    });

    it('maps a book with optional field from entity to dto', async () => {
      expect.assertions(1);

      const { firstName, lastName } = authorTestDataGenerator.generateData();

      const createdAuthor = entityManager.create(Author, {
        firstName,
        lastName,
      });

      const savedAuthor = await entityManager.save(createdAuthor);

      const { name } = categoryTestDataGenerator.generateData();

      const createdCategory = entityManager.create(Category, {
        name,
      });

      const savedCategory = await entityManager.save(createdCategory);

      const { title, releaseYear, language, format, description, price } = bookTestDataGenerator.generateData();

      const createdBook = entityManager.create(Book, {
        title,
        releaseYear,
        language,
        format,
        description: description as string,
        price,
        authorId: savedAuthor.id,
        categoryId: savedCategory.id,
      });

      const savedBook = await entityManager.save(createdBook);

      const bookDto = bookMapper.mapEntityToDto(savedBook);

      expect(bookDto).toEqual({
        id: savedBook.id,
        createdAt: savedBook.createdAt,
        updatedAt: savedBook.updatedAt,
        title: savedBook.title,
        authorId: savedAuthor.id,
        categoryId: savedCategory.id,
        releaseYear: savedBook.releaseYear,
        language: savedBook.language,
        format: savedBook.format,
        description: savedBook.description,
        price: savedBook.price,
      });
    });
  });
});
