import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { FindBooksQueryHandler } from './findBooksQueryHandler';
import { TestTransactionInternalRunner } from '../../../../../../common/tests/testTransactionInternalRunner';
import { EqualFilter, LessThanOrEqualFilter, BetweenFilter } from '../../../../../../common/types/filter';
import { FilterName } from '../../../../../../common/types/filterName';
import { FilterSymbol } from '../../../../../../common/types/filterSymbol';
import { postgresModuleSymbols } from '../../../../../../libs/postgres/postgresModuleSymbols';
import { Application } from '../../../../../application';
import { AuthorBookRepositoryFactory } from '../../../../authorBookModule/application/repositories/authorBookRepository/authorBookRepositoryFactory';
import { authorBookSymbols } from '../../../../authorBookModule/symbols';
import { AuthorBookEntityTestFactory } from '../../../../authorBookModule/tests/factories/authorBookEntityTestFactory/authorBookEntityTestFactory';
import { AuthorRepositoryFactory } from '../../../../authorModule/application/repositories/authorRepository/authorRepositoryFactory';
import { authorSymbols } from '../../../../authorModule/symbols';
import { AuthorEntityTestFactory } from '../../../../authorModule/tests/factories/authorEntityTestFactory/authorEntityTestFactory';
import { BookCategoryRepositoryFactory } from '../../../../bookCategoryModule/application/repositories/bookCategoryRepository/bookCategoryRepositoryFactory';
import { bookCategorySymbols } from '../../../../bookCategoryModule/symbols';
import { BookCategoryEntityTestFactory } from '../../../../bookCategoryModule/tests/factories/bookCategoryEntityTestFactory/bookCategoryEntityTestFactory';
import { CategoryRepositoryFactory } from '../../../../categoryModule/application/repositories/categoryRepository/categoryRepositoryFactory';
import { categorySymbols } from '../../../../categoryModule/symbols';
import { CategoryEntityTestFactory } from '../../../../categoryModule/tests/factories/categoryEntityTestFactory/categoryEntityTestFactory';
import { BookFormat } from '../../../domain/entities/book/bookFormat';
import { BookLanguage } from '../../../domain/entities/book/bookLanguage';
import { symbols } from '../../../symbols';
import { BookEntityTestFactory } from '../../../tests/factories/bookEntityTestFactory/bookEntityTestFactory';
import { BookRepositoryFactory } from '../../repositories/bookRepository/bookRepositoryFactory';

describe('FindBooksQueryHandler', () => {
  let findBooksQueryHandler: FindBooksQueryHandler;
  let bookRepositoryFactory: BookRepositoryFactory;
  let authorRepositoryFactory: AuthorRepositoryFactory;
  let authorBookRepositoryFactory: AuthorBookRepositoryFactory;
  let bookCategoryRepositoryFactory: BookCategoryRepositoryFactory;
  let categoryRepositoryFactory: CategoryRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

  const bookEntityTestFactory = new BookEntityTestFactory();
  const authorEntityTestFactory = new AuthorEntityTestFactory();
  const authorBookEntityTestFactory = new AuthorBookEntityTestFactory();
  const categoryEntityTestFactory = new CategoryEntityTestFactory();
  const bookCategoryEntityTestFactory = new BookCategoryEntityTestFactory();

  beforeAll(async () => {
    const container = Application.createContainer();

    findBooksQueryHandler = container.get<FindBooksQueryHandler>(symbols.findBooksQueryHandler);
    bookRepositoryFactory = container.get<BookRepositoryFactory>(symbols.bookRepositoryFactory);
    authorRepositoryFactory = container.get<AuthorRepositoryFactory>(authorSymbols.authorRepositoryFactory);
    authorBookRepositoryFactory = container.get<AuthorBookRepositoryFactory>(
      authorBookSymbols.authorBookRepositoryFactory,
    );
    bookCategoryRepositoryFactory = container.get<BookCategoryRepositoryFactory>(
      bookCategorySymbols.bookCategoryRepositoryFactory,
    );
    categoryRepositoryFactory = container.get<CategoryRepositoryFactory>(categorySymbols.categoryRepositoryFactory);
    dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('Find books', () => {
    it('finds books by title in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const {
          id: id1,
          title: title1,
          isbn: isbn1,
          releaseYear,
          language,
          format,
          price,
        } = bookEntityTestFactory.create();

        const { id: id2, title: title2, isbn: isbn2 } = bookEntityTestFactory.create();

        const book = await bookRepository.createBook({
          id: id1,
          title: title1,
          isbn: isbn1,
          releaseYear,
          language,
          format,
          price,
        });

        await bookRepository.createBook({
          id: id2,
          title: title2,
          isbn: isbn2,
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

        const { books: foundBooks } = await findBooksQueryHandler.execute({
          unitOfWork,
          filters: [equalFilterForTitleField],
          pagination: {
            page: 1,
            limit: 50,
          },
        });

        expect(foundBooks.find((foundBook) => foundBook.id === book.id)).toBeTruthy();
      });
    });

    it('finds books by release year in database', async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { id: id1, title, isbn: isbn1, language, format, price } = bookEntityTestFactory.create();

        const { id: id2, title: title2, isbn: isbn2 } = bookEntityTestFactory.create();

        const { id: id3, title: title3, isbn: isbn3 } = bookEntityTestFactory.create();

        const book1 = await bookRepository.createBook({
          id: id1,
          title,
          isbn: isbn1,
          releaseYear: 1997,
          language,
          format,
          price,
        });

        const book2 = await bookRepository.createBook({
          id: id2,
          title: title2,
          isbn: isbn2,
          releaseYear: 1999,
          language,
          format,
          price,
        });

        await bookRepository.createBook({
          id: id3,
          title: title3,
          isbn: isbn3,
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

        const { books: foundBooks } = await findBooksQueryHandler.execute({
          unitOfWork,
          filters: [equalFilterForLanguageField, lessThanOrEqualFilterForReleaseYearField],
          pagination: { page: 1, limit: 50 },
        });

        expect(foundBooks.find((foundBook) => foundBook.id === book1.id)).toBeTruthy();
        expect(foundBooks.find((foundBook) => foundBook.id === book2.id)).toBeTruthy();
      });
    });

    it('finds books by price in database', async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { id: id1, title, isbn: isbn1, language, releaseYear, format } = bookEntityTestFactory.create();

        const { id: id2, title: title2, isbn: isbn2 } = bookEntityTestFactory.create();

        const { id: id3, title: title3, isbn: isbn3 } = bookEntityTestFactory.create();

        const book1 = await bookRepository.createBook({
          id: id1,
          title,
          isbn: isbn1,
          releaseYear,
          language,
          format,
          price: 60,
        });

        const book2 = await bookRepository.createBook({
          id: id2,
          title: title2,
          isbn: isbn2,
          releaseYear,
          language,
          format,
          price: 50,
        });

        await bookRepository.createBook({
          id: id3,
          title: title3,
          isbn: isbn3,
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

        const { books: foundBooks } = await findBooksQueryHandler.execute({
          unitOfWork,
          filters: [betweenFilterForPriceField],
          pagination: {
            page: 1,
            limit: 50,
          },
        });

        expect(foundBooks.find((foundBook) => foundBook.id === book1.id)).toBeTruthy();
        expect(foundBooks.find((foundBook) => foundBook.id === book2.id)).toBeTruthy();
      });
    });

    it('finds books by format in database', async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { id: id1, title, isbn: isbn1, language, releaseYear, price } = bookEntityTestFactory.create();

        const { id: id2, title: title2, isbn: isbn2 } = bookEntityTestFactory.create();

        const { id: id3, title: title3, isbn: isbn3 } = bookEntityTestFactory.create();

        const book1 = await bookRepository.createBook({
          id: id1,
          title,
          isbn: isbn1,
          releaseYear,
          language,
          format: BookFormat.paperback,
          price,
        });

        const book2 = await bookRepository.createBook({
          id: id2,
          title: title2,
          isbn: isbn2,
          releaseYear,
          language,
          format: BookFormat.kindle,
          price,
        });

        await bookRepository.createBook({
          id: id3,
          title: title3,
          isbn: isbn3,
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

        const { books: foundBooks } = await findBooksQueryHandler.execute({
          unitOfWork,
          filters: [equalFilterForFormatField],
          pagination: { page: 1, limit: 50 },
        });

        expect(foundBooks.find((foundBook) => foundBook.id === book1.id)).toBeTruthy();
        expect(foundBooks.find((foundBook) => foundBook.id === book2.id)).toBeTruthy();
      });
    });

    it('finds books by language in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();
        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { id: id1, title, isbn, releaseYear, price, format } = bookEntityTestFactory.create();

        const { id: id2 } = bookEntityTestFactory.create();

        await bookRepository.createBook({
          id: id1,
          title,
          isbn,
          releaseYear,
          language: BookLanguage.en,
          format,
          price,
        });

        const polishBook = await bookRepository.createBook({
          id: id2,
          title,
          isbn,
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

        const { books: foundBooks } = await findBooksQueryHandler.execute({
          unitOfWork,
          filters: [equalFilterForLanguageField],
          pagination: {
            page: 1,
            limit: 50,
          },
        });

        expect(foundBooks.find((foundBook) => foundBook.id === polishBook.id)).toBeTruthy();
      });
    });

    it('finds books in database limited by pagination', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { id: id1, title, isbn, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const { id: id2 } = bookEntityTestFactory.create();

        const { id: id3 } = bookEntityTestFactory.create();

        await bookRepository.createBook({
          id: id1,
          title,
          isbn,
          releaseYear,
          language,
          format,
          price,
        });

        await bookRepository.createBook({
          id: id2,
          title,
          isbn,
          releaseYear,
          language,
          format,
          price,
        });

        await bookRepository.createBook({
          id: id3,
          title,
          isbn,
          releaseYear,
          language,
          format,
          price,
        });

        const { books: foundBooks } = await findBooksQueryHandler.execute({
          unitOfWork,
          filters: [],
          pagination: { page: 1, limit: 2 },
        });

        expect(foundBooks.length).toBe(2);
      });
    });
  });

  describe('Find books by author id', () => {
    it('finds books by authorId with filtering in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const authorBookRepository = authorBookRepositoryFactory.create(entityManager);

        const bookEntity1 = bookEntityTestFactory.create();

        const bookEntity2 = bookEntityTestFactory.create();

        const bookEntity3 = bookEntityTestFactory.create();

        const authorEntity = authorEntityTestFactory.create();

        const { id: authorBookId1 } = authorBookEntityTestFactory.create();

        const { id: authorBookId2 } = authorBookEntityTestFactory.create();

        const book1 = await bookRepository.createBook({
          id: bookEntity1.id,
          format: bookEntity1.format,
          language: bookEntity1.language,
          price: bookEntity1.price,
          title: bookEntity1.title,
          isbn: bookEntity1.isbn,
          releaseYear: bookEntity1.releaseYear,
        });

        const book2 = await bookRepository.createBook({
          id: bookEntity2.id,
          format: bookEntity2.format,
          language: bookEntity2.language,
          price: bookEntity2.price,
          title: bookEntity2.title,
          isbn: bookEntity2.isbn,
          releaseYear: bookEntity2.releaseYear,
        });

        await bookRepository.createBook({
          id: bookEntity3.id,
          format: bookEntity3.format,
          language: bookEntity3.language,
          price: bookEntity3.price,
          title: bookEntity3.title,
          isbn: bookEntity3.isbn,
          releaseYear: bookEntity3.releaseYear,
        });

        const author = await authorRepository.createAuthor({
          id: authorEntity.id,
          firstName: authorEntity.firstName,
          lastName: authorEntity.lastName,
        });

        await authorBookRepository.createAuthorBook({ id: authorBookId1, bookId: book1.id, authorId: author.id });

        await authorBookRepository.createAuthorBook({ id: authorBookId2, bookId: book2.id, authorId: author.id });

        const equalFilterForTitleField: EqualFilter = {
          fieldName: 'title',
          filterName: FilterName.equal,
          filterSymbol: FilterSymbol.equal,
          values: [book1.title],
        };

        const { books: foundBooks } = await findBooksQueryHandler.execute({
          unitOfWork,
          authorId: author.id,
          filters: [equalFilterForTitleField],
          pagination: {
            page: 1,
            limit: 50,
          },
        });

        expect(foundBooks.find((foundBook) => foundBook.id === book1.id)).toBeTruthy();
      });
    });
  });

  describe('Find books by category id', () => {
    it('finds books by categoryId with conditions in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const bookCategoryRepository = bookCategoryRepositoryFactory.create(entityManager);

        const categoryEntity1 = categoryEntityTestFactory.create();

        const categoryEntity2 = categoryEntityTestFactory.create();

        const bookEntity1 = bookEntityTestFactory.create();

        const bookEntity2 = bookEntityTestFactory.create();

        const { id: bookCategoryId1 } = bookCategoryEntityTestFactory.create();

        const { id: bookCategoryId2 } = bookCategoryEntityTestFactory.create();

        const category1 = await categoryRepository.createCategory(categoryEntity1);

        const category2 = await categoryRepository.createCategory(categoryEntity2);

        const book1 = await bookRepository.createBook({
          id: bookEntity1.id,
          format: bookEntity1.format,
          language: bookEntity1.language,
          price: bookEntity1.price,
          title: bookEntity1.title,
          isbn: bookEntity1.isbn,
          releaseYear: bookEntity1.releaseYear,
        });

        const book2 = await bookRepository.createBook({
          id: bookEntity2.id,
          format: bookEntity2.format,
          language: bookEntity2.language,
          price: bookEntity2.price,
          title: bookEntity2.title,
          isbn: bookEntity2.isbn,
          releaseYear: bookEntity2.releaseYear,
        });

        await bookCategoryRepository.createBookCategory({
          id: bookCategoryId1,
          categoryId: category1.id,
          bookId: book1.id,
        });

        await bookCategoryRepository.createBookCategory({
          id: bookCategoryId2,
          categoryId: category2.id,
          bookId: book2.id,
        });

        const { books } = await findBooksQueryHandler.execute({
          unitOfWork,
          categoryId: category1.id,
          filters: [],
          pagination: {
            page: 1,
            limit: 50,
          },
        });

        expect(books.find((foundBook) => foundBook.id === book1.id)).toBeTruthy();
      });
    });
  });
});
