import { BookService } from './bookService';
import { BookTestDataGenerator } from '../testDataGenerators/bookTestDataGenerator';
import { ConfigLoader } from '../../../../configLoader';
import {
  BetweenFilter,
  createDIContainer,
  EqualFilter,
  LessThanOrEqualFilter,
  UnitOfWorkModule,
} from '../../../shared';
import { DbModule } from '../../../shared';
import { BookModule } from '../bookModule';
import { AuthorModule } from '../../author/authorModule';
import { BookNotFound } from '../errors';
import { PostgresHelper } from '../../../../integration/helpers/postgresHelper/postgresHelper';
import { CategoryModule } from '../../category/categoryModule';
import { AuthorTestDataGenerator } from '../../author/testDataGenerators/authorTestDataGenerator';
import { AuthorBookModule } from '../../authorBook/authorBookModule';
import { LoggerModule } from '../../../shared/logger/loggerModule';
import { BOOK_REPOSITORY_FACTORY, BOOK_SERVICE } from '../bookInjectionSymbols';
import { AUTHOR_REPOSITORY_FACTORY } from '../../author/authorInjectionSymbols';
import { AUTHOR_BOOK_REPOSITORY_FACTORY } from '../../authorBook/authorBookInjectionSymbols';
import { BOOK_CATEGORY_REPOSITORY_FACTORY } from '../../bookCategory/bookCategoryInjectionSymbols';
import { CategoryTestDataGenerator } from '../../category/testDataGenerators/categoryTestDataGenerator';
import { CATEGORY_REPOSITORY_FACTORY } from '../../category/categoryInjectionSymbols';
import { BookCategoryModule } from '../../bookCategory/bookCategoryModule';
import { BookFormat, BookLanguage } from '../types';
import { BookRepositoryFactory } from '../repositories/bookRepositoryFactory';
import { AuthorRepositoryFactory } from '../../author/repositories/authorRepositoryFactory';
import { AuthorBookRepositoryFactory } from '../../authorBook/repositories/authorBookRepositoryFactory';
import { BookCategoryRepositoryFactory } from '../../bookCategory/repositories/bookCategoryRepositoryFactory';
import { CategoryRepositoryFactory } from '../../category/repositories/categoryRepositoryFactory';

describe('BookService', () => {
  let bookService: BookService;
  let bookRepositoryFactory: BookRepositoryFactory;
  let authorRepositoryFactory: AuthorRepositoryFactory;
  let authorBookRepositoryFactory: AuthorBookRepositoryFactory;
  let bookCategoryRepositoryFactory: BookCategoryRepositoryFactory;
  let categoryRepositoryFactory: CategoryRepositoryFactory;
  let bookTestDataGenerator: BookTestDataGenerator;
  let authorTestDataGenerator: AuthorTestDataGenerator;
  let categoryTestDataGenerator: CategoryTestDataGenerator;
  let postgresHelper: PostgresHelper;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([
      DbModule,
      BookModule,
      AuthorModule,
      AuthorBookModule,
      CategoryModule,
      BookCategoryModule,
      LoggerModule,
      UnitOfWorkModule,
    ]);

    bookService = container.resolve(BOOK_SERVICE);
    bookRepositoryFactory = container.resolve(BOOK_REPOSITORY_FACTORY);
    authorRepositoryFactory = container.resolve(AUTHOR_REPOSITORY_FACTORY);
    authorBookRepositoryFactory = container.resolve(AUTHOR_BOOK_REPOSITORY_FACTORY);
    bookCategoryRepositoryFactory = container.resolve(BOOK_CATEGORY_REPOSITORY_FACTORY);
    categoryRepositoryFactory = container.resolve(CATEGORY_REPOSITORY_FACTORY);

    postgresHelper = new PostgresHelper(container);

    bookTestDataGenerator = new BookTestDataGenerator();
    authorTestDataGenerator = new AuthorTestDataGenerator();
    categoryTestDataGenerator = new CategoryTestDataGenerator();
  });

  describe('Create book', () => {
    it('creates book in database', async () => {
      expect.assertions(1);

      await postgresHelper.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

        const createdBookDto = await bookService.createBook(unitOfWork, {
          title,
          releaseYear,
          language,
          format,
          price,
        });

        const bookDto = await bookRepository.findOneById(createdBookDto.id);

        expect(bookDto).not.toBeNull();
      });
    });
  });

  describe('Find book', () => {
    it('finds book by id in database', async () => {
      expect.assertions(1);

      await postgresHelper.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

        const book = await bookRepository.createOne({
          title,
          releaseYear,
          language,
          format,
          price,
        });

        const foundBook = await bookService.findBook(unitOfWork, book.id);

        expect(foundBook).not.toBeNull();
      });
    });

    it('should throw if book with given id does not exist in db', async () => {
      expect.assertions(1);

      await postgresHelper.runInTestTransaction(async (unitOfWork) => {
        const { id } = bookTestDataGenerator.generateData();

        try {
          await bookService.findBook(unitOfWork, id);
        } catch (error) {
          expect(error).toBeInstanceOf(BookNotFound);
        }
      });
    });
  });

  describe('Find books', () => {
    it('finds books by title in database', async () => {
      expect.assertions(2);

      await postgresHelper.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

        const book = await bookRepository.createOne({
          title,
          releaseYear,
          language,
          format,
          price,
        });

        const { title: title2 } = bookTestDataGenerator.generateData();

        await bookRepository.createOne({
          title: title2,
          releaseYear,
          language,
          format,
          price,
        });

        const foundBooks = await bookService.findBooks(unitOfWork, [new EqualFilter('title', [title])], {
          page: 1,
          limit: 5,
        });

        expect(foundBooks.length).toBe(1);
        expect(foundBooks[0]).toStrictEqual(book);
      });
    });

    it('finds books by release year in database', async () => {
      expect.assertions(3);

      await postgresHelper.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { title, language, format, price } = bookTestDataGenerator.generateData();

        const book1 = await bookRepository.createOne({
          title,
          releaseYear: 1997,
          language,
          format,
          price,
        });

        const { title: title2 } = bookTestDataGenerator.generateData();

        const book2 = await bookRepository.createOne({
          title: title2,
          releaseYear: 1999,
          language,
          format,
          price,
        });

        const { title: title3 } = bookTestDataGenerator.generateData();

        await bookRepository.createOne({
          title: title3,
          releaseYear: 2005,
          language,
          format,
          price,
        });

        const foundBooks = await bookService.findBooks(
          unitOfWork,
          [new EqualFilter('language', [language]), new LessThanOrEqualFilter('releaseYear', 2000)],
          { page: 1, limit: 5 },
        );

        expect(foundBooks.length).toBe(2);
        expect(foundBooks[0]).toStrictEqual(book1);
        expect(foundBooks[1]).toStrictEqual(book2);
      });
    });

    it('finds books by price in database', async () => {
      expect.assertions(3);

      await postgresHelper.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { title, language, releaseYear, format } = bookTestDataGenerator.generateData();

        const book1 = await bookRepository.createOne({
          title,
          releaseYear,
          language,
          format,
          price: 60,
        });

        const { title: title2 } = bookTestDataGenerator.generateData();

        const book2 = await bookRepository.createOne({
          title: title2,
          releaseYear,
          language,
          format,
          price: 50,
        });

        const { title: title3 } = bookTestDataGenerator.generateData();

        await bookRepository.createOne({
          title: title3,
          releaseYear,
          language,
          format,
          price: 10,
        });

        const foundBooks = await bookService.findBooks(unitOfWork, [new BetweenFilter('price', [40, 80])], {
          page: 1,
          limit: 5,
        });

        expect(foundBooks.length).toBe(2);
        expect(foundBooks[0]).toStrictEqual(book1);
        expect(foundBooks[1]).toStrictEqual(book2);
      });
    });

    it('finds books by format in database', async () => {
      expect.assertions(3);

      await postgresHelper.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { title, language, releaseYear, price } = bookTestDataGenerator.generateData();

        const book1 = await bookRepository.createOne({
          title,
          releaseYear,
          language,
          format: BookFormat.paperback,
          price,
        });

        const { title: title2 } = bookTestDataGenerator.generateData();

        const book2 = await bookRepository.createOne({
          title: title2,
          releaseYear,
          language,
          format: BookFormat.kindle,
          price,
        });

        const { title: title3 } = bookTestDataGenerator.generateData();

        await bookRepository.createOne({
          title: title3,
          releaseYear,
          language,
          format: BookFormat.hardcover,
          price,
        });

        const foundBooks = await bookService.findBooks(
          unitOfWork,
          [new EqualFilter('format', [BookFormat.paperback, BookFormat.kindle])],
          { page: 1, limit: 5 },
        );

        expect(foundBooks.length).toBe(2);
        expect(foundBooks[0]).toStrictEqual(book1);
        expect(foundBooks[1]).toStrictEqual(book2);
      });
    });

    it('finds books by language in database', async () => {
      expect.assertions(2);

      await postgresHelper.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { title, releaseYear, price, format } = bookTestDataGenerator.generateData();

        await bookRepository.createOne({
          title,
          releaseYear,
          language: BookLanguage.en,
          format,
          price,
        });

        const polishBook = await bookRepository.createOne({
          title,
          releaseYear,
          language: BookLanguage.pl,
          format,
          price,
        });

        const foundBooks = await bookService.findBooks(unitOfWork, [new EqualFilter('language', [BookLanguage.pl])], {
          page: 1,
          limit: 5,
        });

        expect(foundBooks.length).toBe(1);
        expect(foundBooks[0]).toStrictEqual(polishBook);
      });
    });

    it('finds books in database limited by pagination', async () => {
      expect.assertions(1);

      await postgresHelper.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

        await bookRepository.createOne({
          title,
          releaseYear,
          language,
          format,
          price,
        });

        await bookRepository.createOne({
          title,
          releaseYear,
          language,
          format,
          price,
        });

        await bookRepository.createOne({
          title,
          releaseYear,
          language,
          format,
          price,
        });

        const foundBooks = await bookService.findBooks(unitOfWork, [], { page: 1, limit: 2 });

        expect(foundBooks.length).toBe(2);
      });
    });
  });

  describe('Find books by author id', () => {
    it('finds books by authorId with filtering in database', async () => {
      expect.assertions(3);

      await postgresHelper.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const bookRepository = bookRepositoryFactory.create(entityManager);
        const authorRepository = authorRepositoryFactory.create(entityManager);
        const authorBookRepository = authorBookRepositoryFactory.create(entityManager);

        const firstBookData = bookTestDataGenerator.generateData();

        const firstBook = await bookRepository.createOne({
          title: firstBookData.title,
          releaseYear: firstBookData.releaseYear,
          language: firstBookData.language,
          format: firstBookData.format,
          price: firstBookData.price,
        });

        const secondBookData = bookTestDataGenerator.generateData();

        const secondBook = await bookRepository.createOne({
          title: secondBookData.title,
          releaseYear: secondBookData.releaseYear,
          language: secondBookData.language,
          format: secondBookData.format,
          price: secondBookData.price,
        });

        const thirdBookData = bookTestDataGenerator.generateData();

        await bookRepository.createOne({
          title: thirdBookData.title,
          releaseYear: thirdBookData.releaseYear,
          language: thirdBookData.language,
          format: thirdBookData.format,
          price: thirdBookData.price,
        });

        const { firstName, lastName } = authorTestDataGenerator.generateData();

        const author = await authorRepository.createOne({
          firstName,
          lastName,
        });

        await authorBookRepository.createOne({ bookId: firstBook.id, authorId: author.id });
        await authorBookRepository.createOne({ bookId: secondBook.id, authorId: author.id });

        const foundBooks = await bookService.findBooksByAuthorId(
          unitOfWork,
          author.id,
          [new EqualFilter('title', [firstBook.title])],
          {
            page: 1,
            limit: 5,
          },
        );

        expect(foundBooks).not.toBeNull();
        expect(foundBooks.length).toBe(1);
        expect(foundBooks[0].title).toBe(firstBook.title);
      });
    });
  });

  describe('Find books by category id', () => {
    it('finds books by categoryId with conditions in database', async () => {
      expect.assertions(2);

      await postgresHelper.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const bookRepository = bookRepositoryFactory.create(entityManager);
        const categoryRepository = categoryRepositoryFactory.create(entityManager);
        const bookCategoryRepository = bookCategoryRepositoryFactory.create(entityManager);

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

        const books = await bookService.findBooksByAuthorId(
          unitOfWork,
          category.id,
          [new EqualFilter('title', [title])],
          {
            page: 1,
            limit: 5,
          },
        );

        expect(books.length).toBe(1);
        expect(books[0]).toStrictEqual(book1);
      });
    });
  });

  describe('Update book', () => {
    it('updates book in database', async () => {
      expect.assertions(2);

      await postgresHelper.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

        const { price: newPrice } = bookTestDataGenerator.generateData();

        const book = await bookRepository.createOne({
          title,
          releaseYear,
          language,
          format,
          price,
        });

        const updatedBook = await bookService.updateBook(unitOfWork, book.id, { price: newPrice });

        expect(updatedBook).not.toBeNull();
        expect(updatedBook.price).toBe(newPrice);
      });
    });

    it('should not update book and throw if book with given id does not exist', async () => {
      expect.assertions(1);

      await postgresHelper.runInTestTransaction(async (unitOfWork) => {
        const { id, price } = bookTestDataGenerator.generateData();

        try {
          await bookService.updateBook(unitOfWork, id, { price });
        } catch (error) {
          expect(error).toBeInstanceOf(BookNotFound);
        }
      });
    });
  });

  describe('Remove book', () => {
    it('removes book from database', async () => {
      expect.assertions(1);

      await postgresHelper.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

        const book = await bookRepository.createOne({
          title,
          releaseYear,
          language,
          format,
          price,
        });

        await bookService.removeBook(unitOfWork, book.id);

        const bookDto = await bookRepository.findOneById(book.id);

        expect(bookDto).toBeNull();
      });
    });

    it('should throw if book with given id does not exist', async () => {
      expect.assertions(1);

      await postgresHelper.runInTestTransaction(async (unitOfWork) => {
        const { id } = bookTestDataGenerator.generateData();

        try {
          await bookService.removeBook(unitOfWork, id);
        } catch (error) {
          expect(error).toBeInstanceOf(BookNotFound);
        }
      });
    });
  });
});
