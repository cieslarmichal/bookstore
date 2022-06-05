import { BookCategoryService } from './bookCategoryService';
import { BookCategoryTestDataGenerator } from '../testDataGenerators/bookCategoryTestDataGenerator';
import { ConfigLoader } from '../../../../configLoader';
import { createDIContainer, UnitOfWorkModule } from '../../../shared';
import { DbModule } from '../../../shared';
import { BookCategoryModule } from '../bookCategoryModule';
import { BookCategoryAlreadyExists, BookCategoryNotFound } from '../errors';
import { TestTransactionRunner } from '../../../../integration/helpers/unitOfWorkHelper/testTransactionRunner';
import { BookModule } from '../../book/bookModule';
import { CategoryModule } from '../../category/categoryModule';
import { BookTestDataGenerator } from '../../book/testDataGenerators/bookTestDataGenerator';
import { LoggerModule } from '../../../shared/logger/loggerModule';
import { BOOK_REPOSITORY_FACTORY } from '../../book/bookInjectionSymbols';
import { CategoryTestDataGenerator } from '../../category/testDataGenerators/categoryTestDataGenerator';
import { BOOK_CATEGORY_REPOSITORY_FACTORY, BOOK_CATEGORY_SERVICE } from '../bookCategoryInjectionSymbols';
import { CATEGORY_REPOSITORY_FACTORY } from '../../category/categoryInjectionSymbols';
import { BookCategoryRepositoryFactory } from '../repositories/bookCategoryRepositoryFactory';
import { CategoryRepositoryFactory } from '../../category/repositories/categoryRepositoryFactory';
import { BookRepositoryFactory } from '../../book/repositories/bookRepositoryFactory';

describe('BookCategoryService', () => {
  let bookCategoryService: BookCategoryService;
  let bookCategoryRepositoryFactory: BookCategoryRepositoryFactory;
  let categoryRepositoryFactory: CategoryRepositoryFactory;
  let bookRepositoryFactory: BookRepositoryFactory;
  let bookCategoryTestDataGenerator: BookCategoryTestDataGenerator;
  let categoryTestDataGenerator: CategoryTestDataGenerator;
  let bookTestDataGenerator: BookTestDataGenerator;
  let testTransactionRunner: TestTransactionRunner;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([
      DbModule,
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

    testTransactionRunner = new TestTransactionRunner(container);

    bookCategoryTestDataGenerator = new BookCategoryTestDataGenerator();
    categoryTestDataGenerator = new CategoryTestDataGenerator();
    bookTestDataGenerator = new BookTestDataGenerator();
  });

  describe('Create bookCategory', () => {
    it('creates bookCategory in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const categoryRepository = categoryRepositoryFactory.create(entityManager);
        const bookRepository = bookRepositoryFactory.create(entityManager);
        const bookCategoryRepository = bookCategoryRepositoryFactory.create(entityManager);

        const { name } = categoryTestDataGenerator.generateData();

        const category = await categoryRepository.createOne({
          name,
        });

        const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

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

        const { name } = categoryTestDataGenerator.generateData();

        const category = await categoryRepository.createOne({
          name,
        });

        const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

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

        const { name } = categoryTestDataGenerator.generateData();

        const category = await categoryRepository.createOne({
          name,
        });

        const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

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
