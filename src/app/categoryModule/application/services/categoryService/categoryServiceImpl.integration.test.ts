import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { CategoryService } from './categoryService';
import { TestTransactionInternalRunner } from '../../../../../common/tests/unitOfWork/testTransactionInternalRunner';
import { EqualFilter } from '../../../../../common/types/contracts/filter';
import { FilterName } from '../../../../../common/types/contracts/filterName';
import { FilterSymbol } from '../../../../../common/types/contracts/filterSymbol';
import { DependencyInjectionContainerFactory } from '../../../../../libs/dependencyInjection/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../../../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../../../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../../../../libs/postgres/postgresModule';
import { postgresModuleSymbols } from '../../../../../libs/postgres/postgresModuleSymbols';
import { PostgresModuleConfigTestFactory } from '../../../../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';
import { UnitOfWorkModule } from '../../../../../libs/unitOfWork/unitOfWorkModule';
import { AddressEntity } from '../../../../addressModule/infrastructure/repositories/addressRepository/addressEntity/addressEntity';
import { AuthorBookEntity } from '../../../../authorBookModule/infrastructure/repositories/authorBookRepository/authorBookEntity/authorBookEntity';
import { AuthorModule } from '../../../../authorModule/authorModule';
import { AuthorEntity } from '../../../../authorModule/infrastructure/repositories/authorRepository/authorEntity/authorEntity';
import { BookCategoryEntity } from '../../../../bookCategory/contracts/bookCategoryEntity';
import { BookCategoryRepositoryFactory } from '../../../../bookCategoryModule/application/repositories/bookCategoryRepository/bookCategoryRepositoryFactory';
import { BookCategoryModule } from '../../../../bookCategoryModule/bookCategoryModule';
import { bookCategoryModuleSymbols } from '../../../../bookCategoryModule/bookCategoryModuleSymbols';
import { BookCategoryEntityTestFactory } from '../../../../bookCategoryModule/tests/factories/bookCategoryEntityTestFactory/bookCategoryEntityTestFactory';
import { BookRepositoryFactory } from '../../../../bookModule/application/repositories/bookRepository/bookRepositoryFactory';
import { BookModule } from '../../../../bookModule/bookModule';
import { bookModuleSymbols } from '../../../../bookModule/bookModuleSymbols';
import { BookEntity } from '../../../../bookModule/infrastructure/repositories/bookRepository/bookEntity/bookEntity';
import { BookEntityTestFactory } from '../../../../bookModule/tests/factories/bookEntityTestFactory/bookEntityTestFactory';
import { CartEntity } from '../../../../cartModule/infrastructure/repositories/cartRepository/cartEntity/cartEntity';
import { CustomerEntity } from '../../../../domain/customer/contracts/customerEntity';
import { InventoryEntity } from '../../../../domain/inventory/contracts/inventoryEntity';
import { LineItemEntity } from '../../../../domain/lineItem/contracts/lineItemEntity';
import { OrderEntity } from '../../../../domain/order/contracts/orderEntity';
import { ReviewEntity } from '../../../../domain/review/contracts/reviewEntity';
import { UserEntity } from '../../../../domain/user/contracts/userEntity';
import { CategoryModule } from '../../../categoryModule';
import { categoryModuleSymbols } from '../../../categoryModuleSymbols';
import { CategoryAlreadyExistsError } from '../../../infrastructure/errors/categoryAlreadyExistsError';
import { CategoryNotFoundError } from '../../../infrastructure/errors/categoryNotFoundError';
import { CategoryEntity } from '../../../infrastructure/repositories/categoryRepository/categoryEntity/categoryEntity';
import { CategoryEntityTestFactory } from '../../../tests/factories/categoryEntityTestFactory/categoryEntityTestFactory';
import { CategoryRepositoryFactory } from '../../repositories/categoryRepository/categoryRepositoryFactory';

describe('CategoryServiceImpl', () => {
  let categoryService: CategoryService;
  let categoryRepositoryFactory: CategoryRepositoryFactory;
  let bookRepositoryFactory: BookRepositoryFactory;
  let bookCategoryRepositoryFactory: BookCategoryRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

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
      CartEntity,
      LineItemEntity,
      OrderEntity,
      InventoryEntity,
      ReviewEntity,
    ],
  });

  beforeAll(async () => {
    const container = await DependencyInjectionContainerFactory.create({
      modules: [
        new PostgresModule(postgresModuleConfig),
        new BookModule(),
        new BookCategoryModule(),
        new CategoryModule(),
        new AuthorModule(),
        new LoggerModule(loggerModuleConfig),
        new UnitOfWorkModule(),
      ],
    });

    categoryService = container.get<CategoryService>(categoryModuleSymbols.categoryService);
    categoryRepositoryFactory = container.get<CategoryRepositoryFactory>(
      categoryModuleSymbols.categoryRepositoryFactory,
    );
    bookRepositoryFactory = container.get<BookRepositoryFactory>(bookModuleSymbols.bookRepositoryFactory);
    bookCategoryRepositoryFactory = container.get<BookCategoryRepositoryFactory>(
      bookCategoryModuleSymbols.bookCategoryRepositoryFactory,
    );
    dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('Create category', () => {
    it('creates category in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
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

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
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

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
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

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
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

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
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

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
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

        const book = await bookRepository.createOne({
          id: bookEntity.id,
          format: bookEntity.format,
          language: bookEntity.language,
          price: bookEntity.price,
          title: bookEntity.title,
          isbn: bookEntity.isbn,
          releaseYear: bookEntity.releaseYear,
        });

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

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
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

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
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
