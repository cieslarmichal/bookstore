import 'reflect-metadata';

import { describe, it, beforeAll, afterAll, expect, vi } from 'vitest';

import { BetweenFilter, EqualFilter, LessThanOrEqualFilter } from '../../../../../common/filter/filter';
import { FilterName } from '../../../../../common/filter/filterName';
import { FilterSymbol } from '../../../../../common/filter/filterSymbol';
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
import { AuthorBookEntityTestFactory } from '../../../../authorBook/tests/factories/authorBookEntityTestFactory/authorBookEntityTestFactory';
import { BookCategoryModule } from '../../../../bookCategory/bookCategoryModule';
import { bookCategorySymbols } from '../../../../bookCategory/bookCategorySymbols';
import { BookCategoryRepositoryFactory } from '../../../../bookCategory/contracts/factories/bookCategoryRepositoryFactory/bookCategoryRepositoryFactory';
import { BookCategoryEntityTestFactory } from '../../../../bookCategory/tests/factories/bookCategoryEntityTestFactory/bookCategoryEntityTestFactory';
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
  const authorBookEntityTestFactory = new AuthorBookEntityTestFactory();
  const categoryEntityTestFactory = new CategoryEntityTestFactory();
  const bookCategoryEntityTestFactory = new BookCategoryEntityTestFactory();

  const loggerModuleConfig = new LoggerModuleConfigTestFactory().create();
  const postgresModuleConfig = new PostgresModuleConfigTestFactory().create();

  beforeAll(async () => {
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

        const book = await bookService.createBook({
          unitOfWork,
          draft: {
            title,
            releaseYear,
            language,
            format,
            price,
          },
        });

        const foundBook = await bookRepository.findOne({ id: book.id });

        expect(foundBook).not.toBeNull();
      });
    });
  });

  describe('Find book', () => {
    it('finds book by id in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { id, title, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const book = await bookRepository.createOne({
          id,
          title,
          releaseYear,
          language,
          format,
          price,
        });

        const foundBook = await bookService.findBook({ unitOfWork, bookId: book.id });

        expect(foundBook).not.toBeNull();
      });
    });

    it('should throw if book with given id does not exist in db', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { id } = bookEntityTestFactory.create();

        try {
          await bookService.findBook({ unitOfWork, bookId: id });
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

        const { id: id1, title: title1, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const { id: id2, title: title2 } = bookEntityTestFactory.create();

        const book = await bookRepository.createOne({
          id: id1,
          title: title1,
          releaseYear,
          language,
          format,
          price,
        });

        await bookRepository.createOne({
          id: id2,
          title: title2,
          releaseYear,
          language,
          format,
          price,
        });

        const equalFilterForTitleField: EqualFilter = {
          fieldName: 'title',
          filterName: FilterName.equal,
          filterSymbol: FilterSymbol.equal,
          values: [title1],
        };

        const foundBooks = await bookService.findBooks({
          unitOfWork,
          filters: [equalFilterForTitleField],
          pagination: {
            page: 1,
            limit: 5,
          },
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

        const { id: id1, title, language, format, price } = bookEntityTestFactory.create();

        const { id: id2, title: title2 } = bookEntityTestFactory.create();

        const { id: id3, title: title3 } = bookEntityTestFactory.create();

        const book1 = await bookRepository.createOne({
          id: id1,
          title,
          releaseYear: 1997,
          language,
          format,
          price,
        });

        const book2 = await bookRepository.createOne({
          id: id2,
          title: title2,
          releaseYear: 1999,
          language,
          format,
          price,
        });

        await bookRepository.createOne({
          id: id3,
          title: title3,
          releaseYear: 2005,
          language,
          format,
          price,
        });

        const equalFilterForLanguageField: EqualFilter = {
          fieldName: 'language',
          filterName: FilterName.equal,
          filterSymbol: FilterSymbol.equal,
          values: [language],
        };

        const lessThanOrEqualFilterForReleaseYearField: LessThanOrEqualFilter = {
          fieldName: 'releaseYear',
          filterName: FilterName.lessThanOrEqual,
          filterSymbol: FilterSymbol.lessThanOrEqual,
          value: 2000,
        };

        const foundBooks = await bookService.findBooks({
          unitOfWork,
          filters: [equalFilterForLanguageField, lessThanOrEqualFilterForReleaseYearField],
          pagination: { page: 1, limit: 5 },
        });

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

        const { id: id1, title, language, releaseYear, format } = bookEntityTestFactory.create();

        const { id: id2, title: title2 } = bookEntityTestFactory.create();

        const { id: id3, title: title3 } = bookEntityTestFactory.create();

        const book1 = await bookRepository.createOne({
          id: id1,
          title,
          releaseYear,
          language,
          format,
          price: 60,
        });

        const book2 = await bookRepository.createOne({
          id: id2,
          title: title2,
          releaseYear,
          language,
          format,
          price: 50,
        });

        await bookRepository.createOne({
          id: id3,
          title: title3,
          releaseYear,
          language,
          format,
          price: 10,
        });

        const betweenFilterForPriceField: BetweenFilter = {
          fieldName: 'price',
          filterName: FilterName.between,
          filterSymbol: FilterSymbol.between,
          from: 40,
          to: 80,
        };

        const foundBooks = await bookService.findBooks({
          unitOfWork,
          filters: [betweenFilterForPriceField],
          pagination: {
            page: 1,
            limit: 5,
          },
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

        const { id: id1, title, language, releaseYear, price } = bookEntityTestFactory.create();

        const { id: id2, title: title2 } = bookEntityTestFactory.create();

        const { id: id3, title: title3 } = bookEntityTestFactory.create();

        const book1 = await bookRepository.createOne({
          id: id1,
          title,
          releaseYear,
          language,
          format: BookFormat.paperback,
          price,
        });

        const book2 = await bookRepository.createOne({
          id: id2,
          title: title2,
          releaseYear,
          language,
          format: BookFormat.kindle,
          price,
        });

        await bookRepository.createOne({
          id: id3,
          title: title3,
          releaseYear,
          language,
          format: BookFormat.hardcover,
          price,
        });

        const equalFilterForFormatField: EqualFilter = {
          fieldName: 'format',
          filterName: FilterName.equal,
          filterSymbol: FilterSymbol.equal,
          values: [BookFormat.paperback, BookFormat.kindle],
        };

        const foundBooks = await bookService.findBooks({
          unitOfWork,
          filters: [equalFilterForFormatField],
          pagination: { page: 1, limit: 5 },
        });

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

        const { id: id1, title, releaseYear, price, format } = bookEntityTestFactory.create();

        const { id: id2 } = bookEntityTestFactory.create();

        await bookRepository.createOne({
          id: id1,
          title,
          releaseYear,
          language: BookLanguage.en,
          format,
          price,
        });

        const polishBook = await bookRepository.createOne({
          id: id2,
          title,
          releaseYear,
          language: BookLanguage.pl,
          format,
          price,
        });

        const equalFilterForLanguageField: EqualFilter = {
          fieldName: 'language',
          filterName: FilterName.equal,
          filterSymbol: FilterSymbol.equal,
          values: [BookLanguage.pl],
        };

        const foundBooks = await bookService.findBooks({
          unitOfWork,
          filters: [equalFilterForLanguageField],
          pagination: {
            page: 1,
            limit: 5,
          },
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

        const { id: id1, title, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const { id: id2 } = bookEntityTestFactory.create();

        const { id: id3 } = bookEntityTestFactory.create();

        await bookRepository.createOne({
          id: id1,
          title,
          releaseYear,
          language,
          format,
          price,
        });

        await bookRepository.createOne({
          id: id2,
          title,
          releaseYear,
          language,
          format,
          price,
        });

        await bookRepository.createOne({
          id: id3,
          title,
          releaseYear,
          language,
          format,
          price,
        });

        const foundBooks = await bookService.findBooks({ unitOfWork, filters: [], pagination: { page: 1, limit: 2 } });

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

        const bookEntity1 = bookEntityTestFactory.create();

        const bookEntity2 = bookEntityTestFactory.create();

        const bookEntity3 = bookEntityTestFactory.create();

        const authorEntity = authorEntityTestFactory.create();

        const { id: authorBookId1 } = authorBookEntityTestFactory.create();

        const { id: authorBookId2 } = authorBookEntityTestFactory.create();

        const book1 = await bookRepository.createOne(bookEntity1);

        const book2 = await bookRepository.createOne(bookEntity2);

        await bookRepository.createOne(bookEntity3);

        const author = await authorRepository.createOne(authorEntity);

        await authorBookRepository.createOne({ id: authorBookId1, bookId: book1.id, authorId: author.id });

        await authorBookRepository.createOne({ id: authorBookId2, bookId: book2.id, authorId: author.id });

        const equalFilterForTitleField: EqualFilter = {
          fieldName: 'title',
          filterName: FilterName.equal,
          filterSymbol: FilterSymbol.equal,
          values: [book1.title],
        };

        const foundBooks = await bookService.findBooksByAuthorId({
          unitOfWork,
          authorId: author.id,
          filters: [equalFilterForTitleField],
          pagination: {
            page: 1,
            limit: 5,
          },
        });

        expect(foundBooks).not.toBeNull();
        expect(foundBooks.length).toBe(1);
        expect(foundBooks[0]?.title).toBe(book1.title);
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

        const categoryEntity1 = categoryEntityTestFactory.create();

        const categoryEntity2 = categoryEntityTestFactory.create();

        const bookEntity1 = bookEntityTestFactory.create();

        const bookEntity2 = bookEntityTestFactory.create();

        const { id: bookCategoryId1 } = bookCategoryEntityTestFactory.create();

        const { id: bookCategoryId2 } = bookCategoryEntityTestFactory.create();

        const category1 = await categoryRepository.createOne(categoryEntity1);

        const category2 = await categoryRepository.createOne(categoryEntity2);

        const book1 = await bookRepository.createOne(bookEntity1);

        const book2 = await bookRepository.createOne(bookEntity2);

        await bookCategoryRepository.createOne({
          id: bookCategoryId1,
          categoryId: category1.id,
          bookId: book1.id,
        });

        await bookCategoryRepository.createOne({
          id: bookCategoryId2,
          categoryId: category2.id,
          bookId: book2.id,
        });

        const books = await bookService.findBooksByCategoryId({
          unitOfWork,
          categoryId: category1.id,
          filters: [],
          pagination: {
            page: 1,
            limit: 5,
          },
        });

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

        const { id, title, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const newPrice = price + 1;

        const book = await bookRepository.createOne({
          id,
          title,
          releaseYear,
          language,
          format,
          price,
        });

        const updatedBook = await bookService.updateBook({ unitOfWork, bookId: book.id, draft: { price: newPrice } });

        expect(updatedBook).not.toBeNull();
        expect(updatedBook.price).toBe(newPrice);
      });
    });

    it('should not update book and throw if book with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { id, price } = bookEntityTestFactory.create();

        try {
          await bookService.updateBook({ unitOfWork, bookId: id, draft: { price } });
        } catch (error) {
          expect(error).toBeInstanceOf(BookNotFoundError);
        }
      });
    });
  });

  describe('Delete book', () => {
    it('deletes book from database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { id, title, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const book = await bookRepository.createOne({
          id,
          title,
          releaseYear,
          language,
          format,
          price,
        });

        await bookService.deleteBook({ unitOfWork, bookId: book.id });

        const foundBook = await bookRepository.findOne({ id: book.id });

        expect(foundBook).toBeNull();
      });
    });

    it('should throw if book with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { id } = bookEntityTestFactory.create();

        try {
          await bookService.deleteBook({ unitOfWork, bookId: id });
        } catch (error) {
          expect(error).toBeInstanceOf(BookNotFoundError);
        }
      });
    });
  });
});
