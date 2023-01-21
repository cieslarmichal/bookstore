import { ConfigLoader } from '../../../../../../configLoader';
import { EqualFilter } from '../../../../../common/filter/equalFilter';
import { postgresConnector } from '../../../../../libs/postgres/postgresConnector';
import { PostgresModule } from '../../../../../libs/postgres/postgresModule';
import { createDependencyInjectionContainer } from '../../../../../libs/dependencyInjection/container';
import { LoggerModule } from '../../../../../libs/logger/loggerModule';
import { UnitOfWorkModule } from '../../../../../libs/unitOfWork/unitOfWorkModule';
import { TestTransactionInternalRunner } from '../../../../../tests/helpers';
import { AuthorModule } from '../../../../author/authorModule';
import { BookModule } from '../../../../book/bookModule';
import { BookRepositoryFactory } from '../../../../book/contracts/factories/bookRepositoryFactory/bookRepositoryFactory';
import { BookEntityTestFactory } from '../../../../book/tests/bookEntityTestDataGenerator/bookEntityTestFactoryts';
import { BookCategoryModule } from '../../../../bookCategory/bookCategoryModule';
import { BookCategoryRepositoryFactory } from '../../../../bookCategory/contracts/factories/bookCategoryRepositoryFactory/bookCategoryRepositoryFactory';
import { CategoryModule } from '../../../categoryModule';
import { CategoryRepositoryFactory } from '../../../contracts/factories/categoryRepositoryFactory/categoryRepositoryFactory';
import { CategoryService } from '../../../contracts/services/categoryService/categoryService';
import { CategoryAlreadyExists } from '../../../errors/categoryAlreadyExists';
import { CategoryNotFound } from '../../../errors/categoryNotFound';
import { CategoryTestDataGenerator } from '../../../tests/categoryEntityTestDataGenerator/categoryEntityTestDataGenerator';

describe('CategoryServiceImpl', () => {
  let categoryService: CategoryService;
  let categoryRepositoryFactory: CategoryRepositoryFactory;
  let bookRepositoryFactory: BookRepositoryFactory;
  let bookCategoryRepositoryFactory: BookCategoryRepositoryFactory;
  let categoryEntityTestFactory: CategoryTestDataGenerator;
  let bookEntityTestFactory: BookEntityTestFactory;
  let testTransactionRunner: TestTransactionInternalRunner;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDependencyInjectionContainer([
      PostgresModule,
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

    categoryEntityTestFactory = new CategoryTestDataGenerator();
    bookEntityTestFactory = new BookEntityTestFactory();
  });

  afterAll(async () => {
    postgresConnector.closeConnection();
  });

  describe('Create category', () => {
    it('creates category in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const { name } = categoryEntityTestFactory.generateData();

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

        const { name } = categoryEntityTestFactory.generateData();

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

        const { name } = categoryEntityTestFactory.generateData();

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
        const { id } = categoryEntityTestFactory.generateData();

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

        const { name } = categoryEntityTestFactory.generateData();

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

        const { name } = categoryEntityTestFactory.generateData();

        const category1 = await categoryRepository.createOne({
          name,
        });

        const { name: otherName } = categoryEntityTestFactory.generateData();

        const category2 = await categoryRepository.createOne({
          name: otherName,
        });

        const { title, releaseYear, language, format, price } = bookEntityTestFactory.create();

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

        const { name } = categoryEntityTestFactory.generateData();

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
        const { id } = categoryEntityTestFactory.generateData();

        try {
          await categoryService.removeCategory(unitOfWork, id);
        } catch (error) {
          expect(error).toBeInstanceOf(CategoryNotFound);
        }
      });
    });
  });
});
