import { ConfigLoader } from '../../../../../../configLoader';
import { postgresConnector } from '../../../../../libs/postgres/postgresConnector';
import { PostgresModule } from '../../../../../libs/postgres/postgresModule';
import { createDependencyInjectionContainer } from '../../../../../libs/dependencyInjection/container';
import { LoggerModule } from '../../../../../libs/logger/loggerModule';
import { UnitOfWorkModule } from '../../../../../libs/unitOfWork/unitOfWorkModule';
import { TestTransactionInternalRunner } from '../../../../../tests/helpers';
import { BookModule } from '../../../../book/bookModule';
import { BookRepositoryFactory } from '../../../../book/contracts/factories/bookRepositoryFactory/bookRepositoryFactory';
import { BookEntityTestFactory } from '../../../../book/tests/bookEntityTestDataGenerator/bookEntityTestFactoryts';
import { CATEGORY_REPOSITORY_FACTORY } from '../../../../category/categorySymbols';
import { CategoryModule } from '../../../../category/categoryModule';
import { CategoryRepositoryFactory } from '../../../../category/repositories/categoryRepositoryFactory';
import { CategoryTestDataGenerator } from '../../../../category/testDataGenerators/categoryEntityTestFactory';
import { BookCategoryModule } from '../../../bookCategoryModule';
import { BookCategoryRepositoryFactory } from '../../../contracts/factories/bookCategoryRepositoryFactory/bookCategoryRepositoryFactory';
import { BookCategoryService } from '../../../contracts/services/bookCategoryService/bookCategoryService';
import { BookCategoryAlreadyExists } from '../../../errors/bookCategoryAlreadyExists';
import { BookCategoryNotFound } from '../../../errors/bookCategoryNotFound';
import { BookCategoryTestDataGenerator } from '../../../tests/bookCategoryEntityTestDataGenerator/bookCategoryEntityTestDataGenerator';

describe('BookCategoryService', () => {
  let bookCategoryService: BookCategoryService;
  let bookCategoryRepositoryFactory: BookCategoryRepositoryFactory;
  let categoryRepositoryFactory: CategoryRepositoryFactory;
  let bookRepositoryFactory: BookRepositoryFactory;
  let bookCategoryTestDataGenerator: BookCategoryTestDataGenerator;
  let categoryEntityTestFactory: CategoryTestDataGenerator;
  let bookEntityTestFactory: BookEntityTestFactory;
  let testTransactionRunner: TestTransactionInternalRunner;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDependencyInjectionContainer([
      PostgresModule,
      CategoryModule,
      BookModule,
      BookCategoryModule,
      LoggerModule,
      UnitOfWorkModule,
    ]);

    bookCategoryService = container.resolve(BOOK_CATEGORY_SERVICE);
    bookCategoryRepositoryFactory = container.resolve(BOOK_CATEGORY_REPOSITORY_FACTORY);
    categoryRepositoryFactory = container.resolve(CATEGORY_REPOSITORY_FACTORY);
    bookRepositoryFactory = container.resolve(BOOK_REPOSITORY_FACTORY);

    testTransactionRunner = new TestTransactionInternalRunner(container);

    bookCategoryTestDataGenerator = new BookCategoryTestDataGenerator();
    categoryEntityTestFactory = new CategoryTestDataGenerator();
    bookEntityTestFactory = new BookEntityTestFactory();
  });

  afterAll(async () => {
    postgresConnector.closeConnection();
  });

  describe('Create bookCategory', () => {
    it('creates bookCategory in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const categoryRepository = categoryRepositoryFactory.create(entityManager);
        const bookRepository = bookRepositoryFactory.create(entityManager);
        const bookCategoryRepository = bookCategoryRepositoryFactory.create(entityManager);

        const { name } = categoryEntityTestFactory.generateData();

        const category = await categoryRepository.createOne({
          name,
        });

        const { title, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const book = await bookRepository.createOne({
          title,
          releaseYear,
          language,
          format,
          price,
        });

        const createdBookCategoryDto = await bookCategoryService.createBookCategory(unitOfWork, {
          categoryId: category.id,
          bookId: book.id,
        });

        const bookCategoryDto = await bookCategoryRepository.findOneById(createdBookCategoryDto.id);

        expect(bookCategoryDto).not.toBeNull();
      });
    });

    it('should not create bookCategory and throw if bookCategory with the same bookId and categoryId exists', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const categoryRepository = categoryRepositoryFactory.create(entityManager);
        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { name } = categoryEntityTestFactory.generateData();

        const category = await categoryRepository.createOne({
          name,
        });

        const { title, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const book = await bookRepository.createOne({
          title,
          releaseYear,
          language,
          format,
          price,
        });

        await bookCategoryService.createBookCategory(unitOfWork, {
          categoryId: category.id,
          bookId: book.id,
        });

        try {
          await bookCategoryService.createBookCategory(unitOfWork, {
            categoryId: category.id,
            bookId: book.id,
          });
        } catch (error) {
          expect(error).toBeInstanceOf(BookCategoryAlreadyExists);
        }
      });
    });
  });

  describe('Remove bookCategory', () => {
    it('removes bookCategory from database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const categoryRepository = categoryRepositoryFactory.create(entityManager);
        const bookRepository = bookRepositoryFactory.create(entityManager);
        const bookCategoryRepository = bookCategoryRepositoryFactory.create(entityManager);

        const { name } = categoryEntityTestFactory.generateData();

        const category = await categoryRepository.createOne({
          name,
        });

        const { title, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const book = await bookRepository.createOne({
          title,
          releaseYear,
          language,
          format,
          price,
        });

        const bookCategory = await bookCategoryRepository.createOne({
          categoryId: category.id,
          bookId: book.id,
        });

        await bookCategoryService.removeBookCategory(unitOfWork, { categoryId: category.id, bookId: book.id });

        const bookCategoryDto = await bookCategoryRepository.findOneById(bookCategory.id);

        expect(bookCategoryDto).toBeNull();
      });
    });

    it('should throw if bookCategory with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { categoryId, bookId } = bookCategoryTestDataGenerator.generateData();

        try {
          await bookCategoryService.removeBookCategory(unitOfWork, { categoryId, bookId });
        } catch (error) {
          expect(error).toBeInstanceOf(BookCategoryNotFound);
        }
      });
    });
  });
});
