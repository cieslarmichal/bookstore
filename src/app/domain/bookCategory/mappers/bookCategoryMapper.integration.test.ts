import { BookCategory } from '../entities/bookCategory';
import { BookCategoryMapper } from './bookCategoryMapper';
import { ConfigLoader } from '../../../../configLoader';
import { DbModule, LoggerModule, createDIContainer, UnitOfWorkModule, dbManager } from '../../../common';
import { BookCategoryModule } from '../bookCategoryModule';
import { TestTransactionInternalRunner } from '../../../../integration/helpers/unitOfWorkHelper/testTransactionInternalRunner';
import { BookTestDataGenerator } from '../../book/testDataGenerators/bookTestDataGenerator';
import { Book } from '../../book/entities/book';
import { BOOK_CATEGORY_MAPPER } from '../bookCategoryInjectionSymbols';
import { CategoryTestDataGenerator } from '../../category/testDataGenerators/categoryTestDataGenerator';
import { Category } from '../../category/entities/category';

describe('BookCategoryMapper', () => {
  let bookCategoryMapper: BookCategoryMapper;
  let categoryTestDataGenerator: CategoryTestDataGenerator;
  let bookTestDataGenerator: BookTestDataGenerator;
  let testTransactionRunner: TestTransactionInternalRunner;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([DbModule, BookCategoryModule, LoggerModule, UnitOfWorkModule]);

    bookCategoryMapper = container.resolve(BOOK_CATEGORY_MAPPER);

    testTransactionRunner = new TestTransactionInternalRunner(container);

    categoryTestDataGenerator = new CategoryTestDataGenerator();
    bookTestDataGenerator = new BookTestDataGenerator();
  });

  afterAll(async () => {
    dbManager.closeConnection();
  });

  describe('Map bookCategory', () => {
    it('map bookCategory from entity to dto', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

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

        const bookCategoryDto = bookCategoryMapper.map(savedBookCategory);

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
});
