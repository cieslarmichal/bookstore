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

  describe('Find categories of book', () => {
    it('finds categories of book with condition in database', async () => {
      expect.assertions(2);

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

      const categories = await bookCategoryService.findCategoriesOfBook(
        book.id,
        { name: { eq: name } },
        { page: 1, limit: 5 },
      );

      expect(categories.length).toBe(1);
      expect(categories[0]).toStrictEqual(category1);
    });
  });

  describe('Find books from category', () => {
    it('finds books from category with conditions in database', async () => {
      expect.assertions(2);

      const { name } = categoryTestDataGenerator.generateData();

      const category = await categoryRepository.createOne({
        name,
      });

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const book1 = await bookRepository.createOne({
        title,
        releaseYear,
        language,
        format,
        price,
      });

      const { title: otherTitle } = bookTestDataGenerator.generateData();

      const book2 = await bookRepository.createOne({
        title: otherTitle,
        releaseYear,
        language,
        format,
        price,
      });

      await bookCategoryRepository.createOne({
        categoryId: category.id,
        bookId: book1.id,
      });

      await bookCategoryRepository.createOne({
        categoryId: category.id,
        bookId: book2.id,
      });

      const books = await bookCategoryService.findBooksFromCategory(
        category.id,
        { title: { eq: title }, price: { lte: price } },
        { page: 1, limit: 5 },
      );

      expect(books.length).toBe(1);
      expect(books[0]).toStrictEqual(book1);
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
