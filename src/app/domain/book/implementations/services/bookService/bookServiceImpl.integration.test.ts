import { describe, it, beforeAll, afterAll, expect, vi } from 'vitest';

import { ConfigLoader } from '../../../../../../configLoader';
import { BetweenFilter } from '../../../../../common/filter/betweenFilter';
import { EqualFilter } from '../../../../../common/filter/equalFilter';
import { LessThanOrEqualFilter } from '../../../../../common/filter/lessThanOrEqualFilter';
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
import { authorSymbols } from '../../../../author/authorSymbols';
import { AuthorRepositoryFactory } from '../../../../author/contracts/factories/authorRepositoryFactory/authorRepositoryFactory';
import { AuthorEntityTestFactory } from '../../../../author/tests/factories/authorEntityTestFactory/authorEntityTestFactory';
import { AuthorBookModule } from '../../../../authorBook/authorBookModule';
import { authorBookSymbols } from '../../../../authorBook/authorBookSymbols';
import { AuthorBookRepositoryFactory } from '../../../../authorBook/contracts/factories/authorBookRepositoryFactory/authorBookRepositoryFactory';
import { BookCategoryModule } from '../../../../bookCategory/bookCategoryModule';
import { bookCategorySymbols } from '../../../../bookCategory/bookCategorySymbols';
import { BookCategoryRepositoryFactory } from '../../../../bookCategory/contracts/factories/bookCategoryRepositoryFactory/bookCategoryRepositoryFactory';
import { CategoryModule } from '../../../../category/categoryModule';
import { categorySymbols } from '../../../../category/categorySymbols';
import { CategoryRepositoryFactory } from '../../../../category/contracts/factories/categoryRepositoryFactory/categoryRepositoryFactory';
import { CategoryEntityTestFactory } from '../../../../category/tests/factories/categoryEntityTestFactory/categoryEntityTestFactory';
import { BookModule } from '../../../bookModule';
import { bookSymbols } from '../../../bookSymbols';
import { BookFormat } from '../../../contracts/bookFormat';
import { BookLanguage } from '../../../contracts/bookLanguage';
import { BookRepositoryFactory } from '../../../contracts/factories/bookRepositoryFactory/bookRepositoryFactory';
import { BookService } from '../../../contracts/services/bookService/bookService';
import { BookNotFoundError } from '../../../errors/bookNotFoundError';
import { BookEntityTestFactory } from '../../../tests/factories/bookEntityTestFactory/bookEntityTestFactory';

describe('BookServiceImpl', () => {
  const spyFactory = new SpyFactory(vi);

  let bookService: BookService;
  let bookRepositoryFactory: BookRepositoryFactory;
  let authorRepositoryFactory: AuthorRepositoryFactory;
  let authorBookRepositoryFactory: AuthorBookRepositoryFactory;
  let bookCategoryRepositoryFactory: BookCategoryRepositoryFactory;
  let categoryRepositoryFactory: CategoryRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let postgresConnector: PostgresConnector;

  const bookEntityTestFactory = new BookEntityTestFactory();
  const authorEntityTestFactory = new AuthorEntityTestFactory();
  const categoryEntityTestFactory = new CategoryEntityTestFactory();

  const loggerModuleConfig = new LoggerModuleConfigTestFactory().create();
  const postgresModuleConfig = new PostgresModuleConfigTestFactory().create();

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDependencyInjectionContainer([
      new PostgresModule(postgresModuleConfig),
      new BookModule(),
      new AuthorModule(),
      new AuthorBookModule(),
      new CategoryModule(),
      new BookCategoryModule(),
      new LoggerModule(loggerModuleConfig),
      new UnitOfWorkModule(),
    ]);

    bookService = container.resolve(bookSymbols.bookService);
    bookRepositoryFactory = container.resolve(bookSymbols.bookRepositoryFactory);
    authorRepositoryFactory = container.resolve(authorSymbols.authorRepositoryFactory);
    authorBookRepositoryFactory = container.resolve(authorBookSymbols.authorBookRepositoryFactory);
    bookCategoryRepositoryFactory = container.resolve(bookCategorySymbols.bookCategoryRepositoryFactory);
    categoryRepositoryFactory = container.resolve(categorySymbols.categoryRepositoryFactory);
    postgresConnector = container.resolve(postgresSymbols.postgresConnector);

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    postgresConnector.closeConnection();
  });

  describe('Create book', () => {
    it('creates book in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { title, releaseYear, language, format, price } = bookEntityTestFactory.create();

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

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { title, releaseYear, language, format, price } = bookEntityTestFactory.create();

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

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { id } = bookEntityTestFactory.create();

        try {
          await bookService.findBook(unitOfWork, id);
        } catch (error) {
          expect(error).toBeInstanceOf(BookNotFoundError);
        }
      });
    });
  });

  describe('Find books', () => {
    it('finds books by title in database', async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { title, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const book = await bookRepository.createOne({
          title,
          releaseYear,
          language,
          format,
          price,
        });

        const { title: title2 } = bookEntityTestFactory.create();

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

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { title, language, format, price } = bookEntityTestFactory.create();

        const book1 = await bookRepository.createOne({
          title,
          releaseYear: 1997,
          language,
          format,
          price,
        });

        const { title: title2 } = bookEntityTestFactory.create();

        const book2 = await bookRepository.createOne({
          title: title2,
          releaseYear: 1999,
          language,
          format,
          price,
        });

        const { title: title3 } = bookEntityTestFactory.create();

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

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { title, language, releaseYear, format } = bookEntityTestFactory.create();

        const book1 = await bookRepository.createOne({
          title,
          releaseYear,
          language,
          format,
          price: 60,
        });

        const { title: title2 } = bookEntityTestFactory.create();

        const book2 = await bookRepository.createOne({
          title: title2,
          releaseYear,
          language,
          format,
          price: 50,
        });

        const { title: title3 } = bookEntityTestFactory.create();

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

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { title, language, releaseYear, price } = bookEntityTestFactory.create();

        const book1 = await bookRepository.createOne({
          title,
          releaseYear,
          language,
          format: BookFormat.paperback,
          price,
        });

        const { title: title2 } = bookEntityTestFactory.create();

        const book2 = await bookRepository.createOne({
          title: title2,
          releaseYear,
          language,
          format: BookFormat.kindle,
          price,
        });

        const { title: title3 } = bookEntityTestFactory.create();

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

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { title, releaseYear, price, format } = bookEntityTestFactory.create();

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

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { title, releaseYear, language, format, price } = bookEntityTestFactory.create();

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

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const bookRepository = bookRepositoryFactory.create(entityManager);
        const authorRepository = authorRepositoryFactory.create(entityManager);
        const authorBookRepository = authorBookRepositoryFactory.create(entityManager);

        const firstBookData = bookEntityTestFactory.create();

        const firstBook = await bookRepository.createOne({
          title: firstBookData.title,
          releaseYear: firstBookData.releaseYear,
          language: firstBookData.language,
          format: firstBookData.format,
          price: firstBookData.price,
        });

        const secondBookData = bookEntityTestFactory.create();

        const secondBook = await bookRepository.createOne({
          title: secondBookData.title,
          releaseYear: secondBookData.releaseYear,
          language: secondBookData.language,
          format: secondBookData.format,
          price: secondBookData.price,
        });

        const thirdBookData = bookEntityTestFactory.create();

        await bookRepository.createOne({
          title: thirdBookData.title,
          releaseYear: thirdBookData.releaseYear,
          language: thirdBookData.language,
          format: thirdBookData.format,
          price: thirdBookData.price,
        });

        const { firstName, lastName } = authorEntityTestFactory.create();

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
        expect(foundBooks[0]?.title).toBe(firstBook.title);
      });
    });
  });

  describe('Find books by category id', () => {
    it('finds books by categoryId with conditions in database', async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const bookRepository = bookRepositoryFactory.create(entityManager);
        const categoryRepository = categoryRepositoryFactory.create(entityManager);
        const bookCategoryRepository = bookCategoryRepositoryFactory.create(entityManager);

        const { name } = categoryEntityTestFactory.create();

        const category = await categoryRepository.createOne({
          name,
        });

        const { title, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const book1 = await bookRepository.createOne({
          title,
          releaseYear,
          language,
          format,
          price,
        });

        const { title: otherTitle } = bookEntityTestFactory.create();

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

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { title, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const { price: newPrice } = bookEntityTestFactory.create();

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

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { id, price } = bookEntityTestFactory.create();

        try {
          await bookService.updateBook(unitOfWork, id, { price });
        } catch (error) {
          expect(error).toBeInstanceOf(BookNotFoundError);
        }
      });
    });
  });

  describe('Remove book', () => {
    it('removes book from database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { title, releaseYear, language, format, price } = bookEntityTestFactory.create();

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

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { id } = bookEntityTestFactory.create();

        try {
          await bookService.removeBook(unitOfWork, id);
        } catch (error) {
          expect(error).toBeInstanceOf(BookNotFoundError);
        }
      });
    });
  });
});
