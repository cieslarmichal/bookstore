import { CategoryService } from './categoryService';
import { CategoryTestDataGenerator } from '../testDataGenerators/categoryTestDataGenerator';
import { ConfigLoader } from '../../../../configLoader';
import { createDIContainer, dbManager, EqualFilter, UnitOfWorkModule } from '../../../common';
import { DbModule } from '../../../common';
import { CategoryModule } from '../categoryModule';
import { AuthorModule } from '../../author/authorModule';
import { CategoryAlreadyExists, CategoryNotFound } from '../errors';
import { TestTransactionInternalRunner } from '../../../../integration/helpers/unitOfWorkHelper/testTransactionInternalRunner';
import { LoggerModule } from '../../../common/logger/loggerModule';
import { CATEGORY_REPOSITORY_FACTORY, CATEGORY_SERVICE } from '../categoryInjectionSymbols';
import { BookTestDataGenerator } from '../../book/testDataGenerators/bookTestDataGenerator';
import { BookModule } from '../../book/bookModule';
import { BookCategoryModule } from '../../bookCategory/bookCategoryModule';
import { BOOK_REPOSITORY_FACTORY } from '../../book/bookInjectionSymbols';
import { BOOK_CATEGORY_REPOSITORY_FACTORY } from '../../bookCategory/bookCategoryInjectionSymbols';
import { CategoryRepositoryFactory } from '../repositories/categoryRepositoryFactory';
import { BookRepositoryFactory } from '../../book/repositories/bookRepositoryFactory';
import { BookCategoryRepositoryFactory } from '../../bookCategory/repositories/bookCategoryRepositoryFactory';

describe('CategoryService', () => {
  let categoryService: CategoryService;
  let categoryRepositoryFactory: CategoryRepositoryFactory;
  let bookRepositoryFactory: BookRepositoryFactory;
  let bookCategoryRepositoryFactory: BookCategoryRepositoryFactory;
  let categoryTestDataGenerator: CategoryTestDataGenerator;
  let bookTestDataGenerator: BookTestDataGenerator;
  let testTransactionRunner: TestTransactionInternalRunner;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([
      DbModule,
      BookModule,
      BookCategoryModule,
      CategoryModule,
      AuthorModule,
      LoggerModule,
      UnitOfWorkModule,
    ]);

    categoryService = container.resolve(CATEGORY_SERVICE);
    categoryRepositoryFactory = container.resolve(CATEGORY_REPOSITORY_FACTORY);
    bookRepositoryFactory = container.resolve(BOOK_REPOSITORY_FACTORY);
    bookCategoryRepositoryFactory = container.resolve(BOOK_CATEGORY_REPOSITORY_FACTORY);

    testTransactionRunner = new TestTransactionInternalRunner(container);

    categoryTestDataGenerator = new CategoryTestDataGenerator();
    bookTestDataGenerator = new BookTestDataGenerator();
  });

  afterAll(async () => {
    dbManager.closeConnection();
  });

  describe('Create category', () => {
    it('creates category in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const { name } = categoryTestDataGenerator.generateData();

        const createdCategoryDto = await categoryService.createCategory(unitOfWork, {
          name,
        });

        const categoryDto = await categoryRepository.findOneById(createdCategoryDto.id);

        expect(categoryDto).not.toBeNull();
      });
    });

    it('should not create category and throw if category with the same name exists', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const { name } = categoryTestDataGenerator.generateData();

        await categoryRepository.createOne({
          name,
        });

        try {
          await categoryService.createCategory(unitOfWork, {
            name,
          });
        } catch (error) {
          expect(error).toBeInstanceOf(CategoryAlreadyExists);
        }
      });
    });
  });

  describe('Find category', () => {
    it('finds category by id in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const { name } = categoryTestDataGenerator.generateData();

        const category = await categoryRepository.createOne({
          name,
        });

        const foundCategory = await categoryService.findCategory(unitOfWork, category.id);

        expect(foundCategory).not.toBeNull();
      });
    });

    it('should throw if category with given id does not exist in db', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { id } = categoryTestDataGenerator.generateData();

        try {
          await categoryService.findCategory(unitOfWork, id);
        } catch (error) {
          expect(error).toBeInstanceOf(CategoryNotFound);
        }
      });
    });
  });

  describe('Find categories', () => {
    it('finds categories by condition in database', async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const { name } = categoryTestDataGenerator.generateData();

        const category = await categoryRepository.createOne({
          name,
        });

        const foundCategories = await categoryService.findCategories(unitOfWork, [new EqualFilter('name', [name])], {
          page: 1,
          limit: 5,
        });

        expect(foundCategories.length).toBe(1);
        expect(foundCategories[0]).toStrictEqual(category);
      });
    });
  });

  describe('Find categories by book id', () => {
    it('finds categories by bookId with condition in database', async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const categoryRepository = categoryRepositoryFactory.create(entityManager);
        const bookRepository = bookRepositoryFactory.create(entityManager);
        const bookCategoryRepository = bookCategoryRepositoryFactory.create(entityManager);

        const { name } = categoryTestDataGenerator.generateData();

        const category1 = await categoryRepository.createOne({
          name,
        });

        const { name: otherName } = categoryTestDataGenerator.generateData();

        const category2 = await categoryRepository.createOne({
          name: otherName,
        });

        const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

        const book = await bookRepository.createOne({
          title,
          releaseYear,
          language,
          format,
          price,
        });

        await bookCategoryRepository.createOne({
          categoryId: category1.id,
          bookId: book.id,
        });

        await bookCategoryRepository.createOne({
          categoryId: category2.id,
          bookId: book.id,
        });

        const categories = await categoryService.findCategoriesByBookId(
          unitOfWork,
          book.id,
          [new EqualFilter('name', [name])],
          {
            page: 1,
            limit: 5,
          },
        );

        expect(categories.length).toBe(1);
        expect(categories[0]).toStrictEqual(category1);
      });
    });
  });

  describe('Remove category', () => {
    it('removes category from database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const { name } = categoryTestDataGenerator.generateData();

        const category = await categoryRepository.createOne({
          name,
        });

        await categoryService.removeCategory(unitOfWork, category.id);

        const categoryDto = await categoryRepository.findOneById(category.id);

        expect(categoryDto).toBeNull();
      });
    });

    it('should throw if category with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { id } = categoryTestDataGenerator.generateData();

        try {
          await categoryService.removeCategory(unitOfWork, id);
        } catch (error) {
          expect(error).toBeInstanceOf(CategoryNotFound);
        }
      });
    });
  });
});
