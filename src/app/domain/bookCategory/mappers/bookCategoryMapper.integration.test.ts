import { EntityManager } from 'typeorm';
import { BookCategory } from '../entities/bookCategory';
import { BookCategoryMapper } from './bookCategoryMapper';
import { ConfigLoader } from '../../../../configLoader';
import { createDIContainer } from '../../../shared';
import { DbModule } from '../../../shared';
import { BookCategoryModule } from '../bookCategoryModule';
import { PostgresHelper } from '../../../../integration/helpers/postgresHelper/postgresHelper';
import { BookTestDataGenerator } from '../../book/testDataGenerators/bookTestDataGenerator';
import { Book } from '../../book/entities/book';
import { LoggerModule } from '../../../shared/logger/loggerModule';
import { BOOK_CATEGORY_MAPPER } from '../bookCategoryInjectionSymbols';
import { ENTITY_MANAGER } from '../../../shared/db/dbInjectionSymbols';
import { CategoryTestDataGenerator } from '../../category/testDataGenerators/categoryTestDataGenerator';
import { Category } from '../../category/entities/category';

describe('BookCategoryMapper', () => {
  let bookCategoryMapper: BookCategoryMapper;
  let categoryTestDataGenerator: CategoryTestDataGenerator;
  let bookTestDataGenerator: BookTestDataGenerator;
  let entityManager: EntityManager;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([DbModule, BookCategoryModule, LoggerModule]);

    bookCategoryMapper = container.resolve(BOOK_CATEGORY_MAPPER);
    entityManager = container.resolve(ENTITY_MANAGER);

    categoryTestDataGenerator = new CategoryTestDataGenerator();
    bookTestDataGenerator = new BookTestDataGenerator();
  });

  afterEach(async () => {
    await PostgresHelper.removeDataFromTables();
  });

  describe('Map bookCategory', () => {
    it('map bookCategory from entity to dto', async () => {
      expect.assertions(1);

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
      });

      const savedBook = await entityManager.save(createdBook);

      const createdBookCategory = entityManager.create(BookCategory, {
        bookId: savedBook.id,
        categoryId: savedCategory.id,
      });

      const savedBookCategory = await entityManager.save(createdBookCategory);

      const bookCategoryDto = bookCategoryMapper.mapEntityToDto(savedBookCategory);

      expect(bookCategoryDto).toEqual({
        id: savedBookCategory.id,
        createdAt: savedBookCategory.createdAt,
        updatedAt: savedBookCategory.updatedAt,
        bookId: savedBook.id,
        categoryId: savedCategory.id,
      });
    });
  });
});
