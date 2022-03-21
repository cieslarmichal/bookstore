import { BookCategoryRepository } from '../repositories/bookCategoryRepository';
import { BookCategoryService } from './bookCategoryService';
import { BookCategoryTestDataGenerator } from '../testDataGenerators/bookCategoryTestDataGenerator';
import { ConfigLoader } from '../../../../configLoader';
import { createDIContainer } from '../../../shared';
import { DbModule } from '../../../shared';
import { BookCategoryModule } from '../bookCategoryModule';
import { BookCategoryAlreadyExists, BookCategoryNotFound } from '../errors';
import { PostgresHelper } from '../../../../integration/helpers/postgresHelper/postgresHelper';
import { BookModule } from '../../book/bookModule';
import { CategoryModule } from '../../category/categoryModule';
import { CategoryRepository } from '../../category/repositories/categoryRepository';
import { BookRepository } from '../../book/repositories/bookRepository';
import { BookTestDataGenerator } from '../../book/testDataGenerators/bookTestDataGenerator';
import { LoggerModule } from '../../../shared/logger/loggerModule';
import { BOOK_REPOSITORY } from '../../book/bookInjectionSymbols';
import { CategoryTestDataGenerator } from '../../category/testDataGenerators/categoryTestDataGenerator';
import { BOOK_CATEGORY_REPOSITORY, BOOK_CATEGORY_SERVICE } from '../bookCategoryInjectionSymbols';
import { CATEGORY_REPOSITORY } from '../../category/categoryInjectionSymbols';

describe('BookCategoryService', () => {
  let bookCategoryService: BookCategoryService;
  let bookCategoryRepository: BookCategoryRepository;
  let categoryRepository: CategoryRepository;
  let bookRepository: BookRepository;
  let bookCategoryTestDataGenerator: BookCategoryTestDataGenerator;
  let categoryTestDataGenerator: CategoryTestDataGenerator;
  let bookTestDataGenerator: BookTestDataGenerator;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([DbModule, CategoryModule, BookModule, BookCategoryModule, LoggerModule]);

    bookCategoryService = container.resolve(BOOK_CATEGORY_SERVICE);
    bookCategoryRepository = container.resolve(BOOK_CATEGORY_REPOSITORY);
    categoryRepository = container.resolve(CATEGORY_REPOSITORY);
    bookRepository = container.resolve(BOOK_REPOSITORY);

    bookCategoryTestDataGenerator = new BookCategoryTestDataGenerator();
    categoryTestDataGenerator = new CategoryTestDataGenerator();
    bookTestDataGenerator = new BookTestDataGenerator();
  });

  afterEach(async () => {
    await PostgresHelper.removeDataFromTables();
  });

  describe('Create bookCategory', () => {
    it('creates bookCategory in database', async () => {
      expect.assertions(1);

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

      const createdBookCategoryDto = await bookCategoryService.createBookCategory({
        categoryId: category.id,
        bookId: book.id,
      });

      const bookCategoryDto = await bookCategoryRepository.findOneById(createdBookCategoryDto.id);

      expect(bookCategoryDto).not.toBeNull();
    });

    it('should not create bookCategory and throw if bookCategory with the same bookId and categoryId exists', async () => {
      expect.assertions(1);

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

      await bookCategoryService.createBookCategory({
        categoryId: category.id,
        bookId: book.id,
      });

      try {
        await bookCategoryService.createBookCategory({
          categoryId: category.id,
          bookId: book.id,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(BookCategoryAlreadyExists);
      }
    });
  });

  describe('Remove bookCategory', () => {
    it('removes bookCategory from database', async () => {
      expect.assertions(1);

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

      await bookCategoryService.removeBookCategory({ categoryId: category.id, bookId: book.id });

      const bookCategoryDto = await bookCategoryRepository.findOneById(bookCategory.id);

      expect(bookCategoryDto).toBeNull();
    });

    it('should throw if bookCategory with given id does not exist', async () => {
      expect.assertions(1);

      const { categoryId, bookId } = bookCategoryTestDataGenerator.generateData();

      try {
        await bookCategoryService.removeBookCategory({ categoryId, bookId });
      } catch (error) {
        expect(error).toBeInstanceOf(BookCategoryNotFound);
      }
    });
  });
});
