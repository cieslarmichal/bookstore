import { describe, it, beforeAll, afterAll, expect, vi } from 'vitest';

import { EqualFilter } from '../../../../../common/filter/filter';
import { FilterName } from '../../../../../common/filter/filterName';
import { FilterSymbol } from '../../../../../common/filter/filterSymbol';
import { createDependencyInjectionContainer } from '../../../../../libs/dependencyInjection/container';
import { LoggerModule } from '../../../../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../../../../libs/logger/loggerModuleConfigTestFactory';
import { PostgresConnector } from '../../../../../libs/postgres/postgresConnector';
import { PostgresModule } from '../../../../../libs/postgres/postgresModule';
import { PostgresModuleConfigTestFactory } from '../../../../../libs/postgres/postgresModuleConfigTestFactory';
import { postgresSymbols } from '../../../../../libs/postgres/postgresSymbols';
import { UnitOfWorkModule } from '../../../../../libs/unitOfWork/unitOfWorkModule';
import { SpyFactory } from '../../../../../tests/factories/spyFactory';
import { TestTransactionInternalRunner } from '../../../../../tests/unitOfWork/testTransactionInternalRunner';
import { AuthorModule } from '../../../../author/authorModule';
import { BookModule } from '../../../../book/bookModule';
import { bookSymbols } from '../../../../book/bookSymbols';
import { BookRepositoryFactory } from '../../../../book/contracts/factories/bookRepositoryFactory/bookRepositoryFactory';
import { BookEntityTestFactory } from '../../../../book/tests/factories/bookEntityTestFactory/bookEntityTestFactory';
import { BookCategoryModule } from '../../../../bookCategory/bookCategoryModule';
import { bookCategorySymbols } from '../../../../bookCategory/bookCategorySymbols';
import { BookCategoryRepositoryFactory } from '../../../../bookCategory/contracts/factories/bookCategoryRepositoryFactory/bookCategoryRepositoryFactory';
import { CategoryModule } from '../../../categoryModule';
import { categorySymbols } from '../../../categorySymbols';
import { CategoryRepositoryFactory } from '../../../contracts/factories/categoryRepositoryFactory/categoryRepositoryFactory';
import { CategoryService } from '../../../contracts/services/categoryService/categoryService';
import { CategoryAlreadyExistsError } from '../../../errors/categoryAlreadyExistsError';
import { CategoryNotFoundError } from '../../../errors/categoryNotFoundError';
import { CategoryEntityTestFactory } from '../../../tests/factories/categoryEntityTestFactory/categoryEntityTestFactory';

describe('CategoryServiceImpl', () => {
  const spyFactory = new SpyFactory(vi);

  let categoryService: CategoryService;
  let categoryRepositoryFactory: CategoryRepositoryFactory;
  let bookRepositoryFactory: BookRepositoryFactory;
  let bookCategoryRepositoryFactory: BookCategoryRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let postgresConnector: PostgresConnector;

  const categoryEntityTestFactory = new CategoryEntityTestFactory();
  const bookEntityTestFactory = new BookEntityTestFactory();

  const loggerModuleConfig = new LoggerModuleConfigTestFactory().create();
  const postgresModuleConfig = new PostgresModuleConfigTestFactory().create();

  beforeAll(async () => {
    const container = await createDependencyInjectionContainer([
      new PostgresModule(postgresModuleConfig),
      new BookModule(),
      new BookCategoryModule(),
      new CategoryModule(),
      new AuthorModule(),
      new LoggerModule(loggerModuleConfig),
      new UnitOfWorkModule(),
    ]);

    categoryService = container.resolve(categorySymbols.categoryService);
    categoryRepositoryFactory = container.resolve(categorySymbols.categoryRepositoryFactory);
    bookRepositoryFactory = container.resolve(bookSymbols.bookRepositoryFactory);
    bookCategoryRepositoryFactory = container.resolve(bookCategorySymbols.bookCategoryRepositoryFactory);
    postgresConnector = container.resolve(postgresSymbols.postgresConnector);

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    postgresConnector.closeConnection();
  });

  describe('Create category', () => {
    it('creates category in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const { name } = categoryEntityTestFactory.create();

        const createdCategoryDto = await categoryService.createCategory(unitOfWork, {
          name,
        });

        const categoryDto = await categoryRepository.findOneById(createdCategoryDto.id);

        expect(categoryDto).not.toBeNull();
      });
    });

    it('should not create category and throw if category with the same name exists', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const { name } = categoryEntityTestFactory.create();

        await categoryRepository.createOne({
          name,
        });

        try {
          await categoryService.createCategory(unitOfWork, {
            name,
          });
        } catch (error) {
          expect(error).toBeInstanceOf(CategoryAlreadyExistsError);
        }
      });
    });
  });

  describe('Find category', () => {
    it('finds category by id in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const { name } = categoryEntityTestFactory.create();

        const category = await categoryRepository.createOne({
          name,
        });

        const foundCategory = await categoryService.findCategory(unitOfWork, category.id);

        expect(foundCategory).not.toBeNull();
      });
    });

    it('should throw if category with given id does not exist in db', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { id } = categoryEntityTestFactory.create();

        try {
          await categoryService.findCategory(unitOfWork, id);
        } catch (error) {
          expect(error).toBeInstanceOf(CategoryNotFoundError);
        }
      });
    });
  });

  describe('Find categories', () => {
    it('finds categories by condition in database', async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const { name } = categoryEntityTestFactory.create();

        const category = await categoryRepository.createOne({
          name,
        });

        const equalFilterForNameField: EqualFilter = {
          fieldName: 'name',
          filterName: FilterName.equal,
          filterSymbol: FilterSymbol.equal,
          values: [name],
        };

        const foundCategories = await categoryService.findCategories(unitOfWork, [equalFilterForNameField], {
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

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const categoryRepository = categoryRepositoryFactory.create(entityManager);
        const bookRepository = bookRepositoryFactory.create(entityManager);
        const bookCategoryRepository = bookCategoryRepositoryFactory.create(entityManager);

        const { name } = categoryEntityTestFactory.create();

        const category1 = await categoryRepository.createOne({
          name,
        });

        const { name: otherName } = categoryEntityTestFactory.create();

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

        const equalFilterForNameField: EqualFilter = {
          fieldName: 'name',
          filterName: FilterName.equal,
          filterSymbol: FilterSymbol.equal,
          values: [name],
        };

        const categories = await categoryService.findCategoriesByBookId(
          unitOfWork,
          book.id,
          [equalFilterForNameField],
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

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const { name } = categoryEntityTestFactory.create();

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

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { id } = categoryEntityTestFactory.create();

        try {
          await categoryService.removeCategory(unitOfWork, id);
        } catch (error) {
          expect(error).toBeInstanceOf(CategoryNotFoundError);
        }
      });
    });
  });
});
