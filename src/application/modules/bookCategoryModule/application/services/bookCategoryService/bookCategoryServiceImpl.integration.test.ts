import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { BookCategoryService } from './bookCategoryService';
import { TestTransactionInternalRunner } from '../../../../../common/tests/testTransactionInternalRunner';
import { DependencyInjectionContainerFactory } from '../../../../../libs/dependencyInjection/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../../../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../../../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../../../../libs/postgres/postgresModule';
import { postgresModuleSymbols } from '../../../../../libs/postgres/postgresModuleSymbols';
import { PostgresModuleConfigTestFactory } from '../../../../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';
import { UnitOfWorkModule } from '../../../../../libs/unitOfWork/unitOfWorkModule';
import { AddressEntity } from '../../../../addressModule/infrastructure/repositories/addressRepository/addressEntity/addressEntity';
import { AuthorBookEntity } from '../../../../authorBookModule/infrastructure/repositories/authorBookRepository/authorBookEntity/authorBookEntity';
import { AuthorEntity } from '../../../../authorModule/infrastructure/repositories/authorRepository/authorEntity/authorEntity';
import { BookRepositoryFactory } from '../../../../bookModule/application/repositories/bookRepository/bookRepositoryFactory';
import { BookModule } from '../../../../bookModule/bookModule';
import { bookModuleSymbols } from '../../../../bookModule/bookModuleSymbols';
import { BookEntity } from '../../../../bookModule/infrastructure/repositories/bookRepository/bookEntity/bookEntity';
import { BookEntityTestFactory } from '../../../../bookModule/tests/factories/bookEntityTestFactory/bookEntityTestFactory';
import { CategoryRepositoryFactory } from '../../../../categoryModule/application/repositories/categoryRepository/categoryRepositoryFactory';
import { CategoryModule } from '../../../../categoryModule/categoryModule';
import { categoryModuleSymbols } from '../../../../categoryModule/categoryModuleSymbols';
import { CategoryEntity } from '../../../../categoryModule/infrastructure/repositories/categoryRepository/categoryEntity/categoryEntity';
import { CategoryEntityTestFactory } from '../../../../categoryModule/tests/factories/categoryEntityTestFactory/categoryEntityTestFactory';
import { CustomerEntity } from '../../../../customerModule/infrastructure/repositories/customerRepository/customerEntity/customerEntity';
import { InventoryEntity } from '../../../../inventoryModule/infrastructure/repositories/inventoryRepository/inventoryEntity/inventoryEntity';
import { CartEntity } from '../../../../orderModule/infrastructure/repositories/cartRepository/cartEntity/cartEntity';
import { LineItemEntity } from '../../../../orderModule/infrastructure/repositories/lineItemRepository/lineItemEntity/lineItemEntity';
import { OrderEntity } from '../../../../orderModule/infrastructure/repositories/orderRepository/orderEntity/orderEntity';
import { ReviewEntity } from '../../../../reviewModule/infrastructure/repositories/reviewRepository/reviewEntity/reviewEntity';
import { UserEntity } from '../../../../userModule/infrastructure/repositories/userRepository/userEntity/userEntity';
import { BookCategoryModule } from '../../../bookCategoryModule';
import { bookCategoryModuleSymbols } from '../../../bookCategoryModuleSymbols';
import { BookCategoryAlreadyExistsError } from '../../../infrastructure/errors/bookCategoryAlreadyExistsError';
import { BookCategoryNotFoundError } from '../../../infrastructure/errors/bookCategoryNotFoundError';
import { BookCategoryEntity } from '../../../infrastructure/repositories/bookCategoryRepository/bookCategoryEntity/bookCategoryEntity';
import { BookCategoryEntityTestFactory } from '../../../tests/factories/bookCategoryEntityTestFactory/bookCategoryEntityTestFactory';
import { BookCategoryRepositoryFactory } from '../../repositories/bookCategoryRepository/bookCategoryRepositoryFactory';

describe('BookCategoryService', () => {
  let bookCategoryService: BookCategoryService;
  let bookCategoryRepositoryFactory: BookCategoryRepositoryFactory;
  let categoryRepositoryFactory: CategoryRepositoryFactory;
  let bookRepositoryFactory: BookRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

  const bookCategoryEntityTestFactory = new BookCategoryEntityTestFactory();
  const categoryEntityTestFactory = new CategoryEntityTestFactory();
  const bookEntityTestFactory = new BookEntityTestFactory();

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
        new CategoryModule(),
        new BookModule(),
        new BookCategoryModule(),
        new LoggerModule(loggerModuleConfig),
        new UnitOfWorkModule(),
      ],
    });

    bookCategoryService = container.get<BookCategoryService>(bookCategoryModuleSymbols.bookCategoryService);
    bookCategoryRepositoryFactory = container.get<BookCategoryRepositoryFactory>(
      bookCategoryModuleSymbols.bookCategoryRepositoryFactory,
    );
    categoryRepositoryFactory = container.get<CategoryRepositoryFactory>(
      categoryModuleSymbols.categoryRepositoryFactory,
    );
    bookRepositoryFactory = container.get<BookRepositoryFactory>(bookModuleSymbols.bookRepositoryFactory);
    dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('Create bookCategory', () => {
    it('creates bookCategory in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const bookCategoryRepository = bookCategoryRepositoryFactory.create(entityManager);

        const categoryEntity = categoryEntityTestFactory.create();

        const bookEntity = bookEntityTestFactory.create();

        const category = await categoryRepository.createOne(categoryEntity);

        const book = await bookRepository.createOne({
          id: bookEntity.id,
          format: bookEntity.format,
          language: bookEntity.language,
          price: bookEntity.price,
          title: bookEntity.title,
          isbn: bookEntity.isbn,
          releaseYear: bookEntity.releaseYear,
        });

        const bookCategory = await bookCategoryService.createBookCategory({
          unitOfWork,
          draft: {
            categoryId: category.id,
            bookId: book.id,
          },
        });

        const foundBookCategory = await bookCategoryRepository.findOne({ id: bookCategory.id });

        expect(foundBookCategory).not.toBeNull();
      });
    });

    it('should not create bookCategory and throw if bookCategory with the same bookId and categoryId exists', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const categoryEntity = categoryEntityTestFactory.create();

        const bookEntity = bookEntityTestFactory.create();

        const category = await categoryRepository.createOne(categoryEntity);

        const book = await bookRepository.createOne({
          id: bookEntity.id,
          format: bookEntity.format,
          language: bookEntity.language,
          price: bookEntity.price,
          title: bookEntity.title,
          isbn: bookEntity.isbn,
          releaseYear: bookEntity.releaseYear,
        });

        await bookCategoryService.createBookCategory({
          unitOfWork,
          draft: {
            categoryId: category.id,
            bookId: book.id,
          },
        });

        try {
          await bookCategoryService.createBookCategory({
            unitOfWork,
            draft: {
              categoryId: category.id,
              bookId: book.id,
            },
          });
        } catch (error) {
          expect(error).toBeInstanceOf(BookCategoryAlreadyExistsError);
        }
      });
    });
  });

  describe('Delete bookCategory', () => {
    it('deletes bookCategory from database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const bookCategoryRepository = bookCategoryRepositoryFactory.create(entityManager);

        const categoryEntity = categoryEntityTestFactory.create();

        const bookEntity = bookEntityTestFactory.create();

        const { id: bookCategoryId } = bookCategoryEntityTestFactory.create();

        const category = await categoryRepository.createOne(categoryEntity);

        const book = await bookRepository.createOne({
          id: bookEntity.id,
          format: bookEntity.format,
          language: bookEntity.language,
          price: bookEntity.price,
          title: bookEntity.title,
          isbn: bookEntity.isbn,
          releaseYear: bookEntity.releaseYear,
        });

        const bookCategory = await bookCategoryRepository.createOne({
          id: bookCategoryId,
          categoryId: category.id,
          bookId: book.id,
        });

        await bookCategoryService.deleteBookCategory({ unitOfWork, categoryId: category.id, bookId: book.id });

        const foundBookCategory = await bookCategoryRepository.findOne({ id: bookCategory.id });

        expect(foundBookCategory).toBeNull();
      });
    });

    it('should throw if bookCategory with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { categoryId, bookId } = bookCategoryEntityTestFactory.create();

        try {
          await bookCategoryService.deleteBookCategory({ unitOfWork, categoryId, bookId });
        } catch (error) {
          expect(error).toBeInstanceOf(BookCategoryNotFoundError);
        }
      });
    });
  });
});
