import 'reflect-metadata';

import { describe, it, beforeAll, afterAll, expect, vi } from 'vitest';

import { EqualFilter } from '../../../../../common/filter/filter';
import { FilterName } from '../../../../../common/filter/filterName';
import { FilterSymbol } from '../../../../../common/filter/filterSymbol';
import { SpyFactory } from '../../../../../common/testFactories/spyFactory';
import { TestTransactionInternalRunner } from '../../../../../integrations/common/tests/unitOfWork/testTransactionInternalRunner';
import { DependencyInjectionContainerFactory } from '../../../../../libs/dependencyInjection/implementations/factories/dependencyInjectionContainerFactory/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../../../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../../../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresConnector } from '../../../../../libs/postgres/contracts/postgresConnector';
import { PostgresModule } from '../../../../../libs/postgres/postgresModule';
import { postgresSymbols } from '../../../../../libs/postgres/postgresSymbols';
import { PostgresModuleConfigTestFactory } from '../../../../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';
import { UnitOfWorkModule } from '../../../../../libs/unitOfWork/unitOfWorkModule';
import { AddressEntity } from '../../../../address/contracts/addressEntity';
import { AuthorModule } from '../../../../author/authorModule';
import { AuthorEntity } from '../../../../author/contracts/authorEntity';
import { AuthorBookEntity } from '../../../../authorBook/contracts/authorBookEntity';
import { BookModule } from '../../../../book/bookModule';
import { bookSymbols } from '../../../../book/bookSymbols';
import { BookEntity } from '../../../../book/contracts/bookEntity';
import { BookRepositoryFactory } from '../../../../book/contracts/factories/bookRepositoryFactory/bookRepositoryFactory';
import { BookEntityTestFactory } from '../../../../book/tests/factories/bookEntityTestFactory/bookEntityTestFactory';
import { BookCategoryModule } from '../../../../bookCategory/bookCategoryModule';
import { bookCategorySymbols } from '../../../../bookCategory/bookCategorySymbols';
import { BookCategoryEntity } from '../../../../bookCategory/contracts/bookCategoryEntity';
import { BookCategoryRepositoryFactory } from '../../../../bookCategory/contracts/factories/bookCategoryRepositoryFactory/bookCategoryRepositoryFactory';
import { BookCategoryEntityTestFactory } from '../../../../bookCategory/tests/factories/bookCategoryEntityTestFactory/bookCategoryEntityTestFactory';
import { CustomerEntity } from '../../../../customer/contracts/customerEntity';
import { UserEntity } from '../../../../user/contracts/userEntity';
import { CategoryModule } from '../../../categoryModule';
import { categorySymbols } from '../../../categorySymbols';
import { CategoryEntity } from '../../../contracts/categoryEntity';
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
  const bookCategoryEntityTestFactory = new BookCategoryEntityTestFactory();

  const loggerModuleConfig = new LoggerModuleConfigTestFactory().create();
  const postgresModuleConfig = new PostgresModuleConfigTestFactory().create({
    entities: [
      BookEntity,
      AuthorEntity,
      UserEntity,
      CategoryEntity,
      AuthorBookEntity,
      BookCategoryEntity,
      AddressEntity,
      CustomerEntity,
    ],
  });

  beforeAll(async () => {
    const container = await DependencyInjectionContainerFactory.create([
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
        const entityManager = unitOfWork.getEntityManager();

        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const { name } = categoryEntityTestFactory.create();

        const category = await categoryService.createCategory({
          unitOfWork,
          draft: {
            name,
          },
        });

        const foundCategory = await categoryRepository.findOne({ id: category.id });

        expect(foundCategory).not.toBeNull();
      });
    });

    it('should not create category and throw if category with the same name exists', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const { id, name } = categoryEntityTestFactory.create();

        await categoryRepository.createOne({
          id,
          name,
        });

        try {
          await categoryService.createCategory({
            unitOfWork,
            draft: {
              name,
            },
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
        const entityManager = unitOfWork.getEntityManager();

        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const { id, name } = categoryEntityTestFactory.create();

        const category = await categoryRepository.createOne({
          id,
          name,
        });

        const foundCategory = await categoryService.findCategory({ unitOfWork, categoryId: category.id });

        expect(foundCategory).not.toBeNull();
      });
    });

    it('should throw if category with given id does not exist in db', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { id } = categoryEntityTestFactory.create();

        try {
          await categoryService.findCategory({ unitOfWork, categoryId: id });
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
        const entityManager = unitOfWork.getEntityManager();

        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const { id, name } = categoryEntityTestFactory.create();

        const category = await categoryRepository.createOne({
          id,
          name,
        });

        const equalFilterForNameField: EqualFilter = {
          fieldName: 'name',
          filterName: FilterName.equal,
          filterSymbol: FilterSymbol.equal,
          values: [name],
        };

        const foundCategories = await categoryService.findCategories({
          unitOfWork,
          filters: [equalFilterForNameField],
          pagination: {
            page: 1,
            limit: 5,
          },
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
        const entityManager = unitOfWork.getEntityManager();

        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const bookCategoryRepository = bookCategoryRepositoryFactory.create(entityManager);

        const categoryEntity1 = categoryEntityTestFactory.create();

        const categoryEntity2 = categoryEntityTestFactory.create();

        const bookEntity = bookEntityTestFactory.create();

        const { id: bookCategoryId1 } = bookCategoryEntityTestFactory.create();

        const { id: bookCategoryId2 } = bookCategoryEntityTestFactory.create();

        const category1 = await categoryRepository.createOne(categoryEntity1);

        const category2 = await categoryRepository.createOne(categoryEntity2);

        const book = await bookRepository.createOne(bookEntity);

        await bookCategoryRepository.createOne({
          id: bookCategoryId1,
          categoryId: category1.id,
          bookId: book.id,
        });

        await bookCategoryRepository.createOne({
          id: bookCategoryId2,
          categoryId: category2.id,
          bookId: book.id,
        });

        const equalFilterForNameField: EqualFilter = {
          fieldName: 'name',
          filterName: FilterName.equal,
          filterSymbol: FilterSymbol.equal,
          values: [category1.name],
        };

        const categories = await categoryService.findCategoriesByBookId({
          unitOfWork,
          bookId: book.id,
          filters: [equalFilterForNameField],
          pagination: {
            page: 1,
            limit: 5,
          },
        });

        expect(categories.length).toBe(1);
        expect(categories[0]).toStrictEqual(category1);
      });
    });
  });

  describe('Delete category', () => {
    it('deletes category from database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const { id, name } = categoryEntityTestFactory.create();

        const category = await categoryRepository.createOne({
          id,
          name,
        });

        await categoryService.deleteCategory({ unitOfWork, categoryId: category.id });

        const foundCategory = await categoryRepository.findOne({ id: category.id });

        expect(foundCategory).toBeNull();
      });
    });

    it('should throw if category with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { id } = categoryEntityTestFactory.create();

        try {
          await categoryService.deleteCategory({ unitOfWork, categoryId: id });
        } catch (error) {
          expect(error).toBeInstanceOf(CategoryNotFoundError);
        }
      });
    });
  });
});
