import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { DependencyInjectionContainerFactory } from '../../../../../../libs/dependencyInjection/implementations/factories/dependencyInjectionContainerFactory/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../../../../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../../../../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../../../../../libs/postgres/postgresModule';
import { postgresSymbols } from '../../../../../../libs/postgres/postgresSymbols';
import { PostgresModuleConfigTestFactory } from '../../../../../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';
import { UnitOfWorkModule } from '../../../../../../libs/unitOfWork/unitOfWorkModule';
import { TestTransactionInternalRunner } from '../../../../../integrations/common/tests/unitOfWork/testTransactionInternalRunner';
import { AddressEntity } from '../../../../address/contracts/addressEntity';
import { AuthorEntity } from '../../../../author/contracts/authorEntity';
import { AuthorBookEntity } from '../../../../authorBook/contracts/authorBookEntity';
import { BookModule } from '../../../../book/bookModule';
import { bookSymbols } from '../../../../book/bookSymbols';
import { BookEntity } from '../../../../book/contracts/bookEntity';
import { BookRepositoryFactory } from '../../../../book/contracts/factories/bookRepositoryFactory/bookRepositoryFactory';
import { BookEntityTestFactory } from '../../../../book/tests/factories/bookEntityTestFactory/bookEntityTestFactory';
import { CartEntity } from '../../../../cartModule/infrastructure/repositories/cartRepository/cartEntity/cartEntity';
import { CategoryRepositoryFactory } from '../../../../categoryModule/application/repositories/categoryRepository/categoryRepositoryFactory';
import { CategoryModule } from '../../../../categoryModule/categoryModule';
import { categoryModuleSymbols } from '../../../../categoryModule/categoryModuleSymbols';
import { CategoryEntity } from '../../../../categoryModule/infrastructure/repositories/categoryRepository/categoryEntity/categoryEntity';
import { CategoryEntityTestFactory } from '../../../../categoryModule/tests/factories/categoryEntityTestFactory/categoryEntityTestFactory';
import { CustomerEntity } from '../../../../customerModule/contracts/customerEntity';
import { InventoryEntity } from '../../../../inventoryModule/infrastructure/repositories/inventoryRepository/inventoryEntity/inventoryEntity';
import { LineItemEntity } from '../../../../lineItemModule/infrastructure/repositories/lineItemRepository/lineItemEntity/lineItemEntity';
import { OrderEntity } from '../../../../orderModule/infrastructure/repositories/orderRepository/orderEntity/orderEntity';
import { ReviewEntity } from '../../../../reviewModule/infrastructure/repositories/reviewRepository/reviewEntity/reviewEntity';
import { UserEntity } from '../../../../user/contracts/userEntity';
import { BookCategoryModule } from '../../../bookCategoryModule';
import { bookCategorySymbols } from '../../../bookCategorySymbols';
import { BookCategoryEntity } from '../../../contracts/bookCategoryEntity';
import { BookCategoryRepositoryFactory } from '../../../contracts/factories/bookCategoryRepositoryFactory/bookCategoryRepositoryFactory';
import { BookCategoryService } from '../../../contracts/services/bookCategoryService/bookCategoryService';
import { BookCategoryAlreadyExistsError } from '../../../errors/bookCategoryAlreadyExistsError';
import { BookCategoryNotFoundError } from '../../../errors/bookCategoryNotFoundError';
import { BookCategoryEntityTestFactory } from '../../../tests/factories/bookCategoryEntityTestFactory/bookCategoryEntityTestFactory';

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

    bookCategoryService = container.get<BookCategoryService>(bookCategorySymbols.bookCategoryService);
    bookCategoryRepositoryFactory = container.get<BookCategoryRepositoryFactory>(
      bookCategorySymbols.bookCategoryRepositoryFactory,
    );
    categoryRepositoryFactory = container.get<CategoryRepositoryFactory>(
      categoryModuleSymbols.categoryRepositoryFactory,
    );
    bookRepositoryFactory = container.get<BookRepositoryFactory>(bookSymbols.bookRepositoryFactory);
    dataSource = container.get<DataSource>(postgresSymbols.dataSource);

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
