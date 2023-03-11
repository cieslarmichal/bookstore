import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { BetweenFilter, EqualFilter, LessThanOrEqualFilter } from '../../../../../../common/types/contracts/filter';
import { FilterName } from '../../../../../../common/types/contracts/filterName';
import { FilterSymbol } from '../../../../../../common/types/contracts/filterSymbol';
import { DependencyInjectionContainerFactory } from '../../../../../../libs/dependencyInjection/implementations/factories/dependencyInjectionContainerFactory/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../../../../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../../../../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../../../../../libs/postgres/postgresModule';
import { postgresSymbols } from '../../../../../../libs/postgres/postgresSymbols';
import { PostgresModuleConfigTestFactory } from '../../../../../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';
import { UnitOfWorkModule } from '../../../../../../libs/unitOfWork/unitOfWorkModule';
import { TestTransactionInternalRunner } from '../../../../../integrations/common/tests/unitOfWork/testTransactionInternalRunner';
import { AddressEntity } from '../../../../address/contracts/addressEntity';
import { AuthorModule } from '../../../../author/authorModule';
import { authorSymbols } from '../../../../author/authorSymbols';
import { AuthorEntity } from '../../../../author/contracts/authorEntity';
import { AuthorRepositoryFactory } from '../../../../author/contracts/factories/authorRepositoryFactory/authorRepositoryFactory';
import { AuthorEntityTestFactory } from '../../../../author/tests/factories/authorEntityTestFactory/authorEntityTestFactory';
import { AuthorBookModule } from '../../../../authorBook/authorBookModule';
import { authorBookSymbols } from '../../../../authorBook/authorBookSymbols';
import { AuthorBookEntity } from '../../../../authorBook/contracts/authorBookEntity';
import { AuthorBookRepositoryFactory } from '../../../../authorBook/contracts/factories/authorBookRepositoryFactory/authorBookRepositoryFactory';
import { AuthorBookEntityTestFactory } from '../../../../authorBook/tests/factories/authorBookEntityTestFactory/authorBookEntityTestFactory';
import { BookCategoryModule } from '../../../../bookCategoryModule/bookCategoryModule';
import { bookCategoryModuleSymbols } from '../../../../bookCategoryModule/bookCategoryModuleSymbols';
import { BookCategoryEntity } from '../../../../bookCategoryModule/contracts/bookCategoryEntity';
import { BookCategoryRepositoryFactory } from '../../../../bookCategoryModule/contracts/factories/bookCategoryRepositoryFactory/bookCategoryRepositoryFactory';
import { BookCategoryEntityTestFactory } from '../../../../bookCategoryModule/tests/factories/bookCategoryEntityTestFactory/bookCategoryEntityTestFactory';
import { CartEntity } from '../../../../cartModule/infrastructure/repositories/cartRepository/cartEntity/cartEntity';
import { CategoryRepositoryFactory } from '../../../../categoryModule/application/repositories/categoryRepository/categoryRepositoryFactory';
import { CategoryModule } from '../../../../categoryModule/categoryModule';
import { categoryModuleSymbols } from '../../../../categoryModule/categoryModuleSymbols';
import { CategoryEntity } from '../../../../categoryModule/infrastructure/repositories/categoryRepository/categoryEntity/categoryEntity';
import { CategoryEntityTestFactory } from '../../../../categoryModule/tests/factories/categoryEntityTestFactory/categoryEntityTestFactory';
import { CustomerEntity } from '../../../../customerModule/contracts/customerEntity';
import { InventoryEntity } from '../../../../inventoryModule/infrastructure/repositories/inventoryRepository/inventoryEntity/inventoryEntity';
import { LineItemEntity } from '../../../../lineItem/contracts/lineItemEntity';
import { OrderEntity } from '../../../../order/contracts/orderEntity';
import { ReviewEntity } from '../../../../review/contracts/reviewEntity';
import { UserEntity } from '../../../../user/contracts/userEntity';
import { BookRepositoryFactory } from '../../../application/repositories/bookRepository/bookRepositoryFactory';
import { BookModule } from '../../../bookModule';
import { bookModuleSymbols } from '../../../bookModuleSymbols';
import { BookLanguage } from '../../../contracts/bookLanguage';
import { BookService } from '../../../contracts/services/bookService/bookService';
import { BookFormat } from '../../../domain/entities/book/bookFormat';
import { BookNotFoundError } from '../../../errors/bookNotFoundError';
import { BookEntity } from '../../../infrastructure/repositories/bookRepository/bookEntity/bookEntity';
import { BookEntityTestFactory } from '../../../tests/factories/bookEntityTestFactory/bookEntityTestFactory';

describe('BookServiceImpl', () => {
  let bookService: BookService;
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
        new BookModule(),
        new AuthorModule(),
        new AuthorBookModule(),
        new CategoryModule(),
        new BookCategoryModule(),
        new LoggerModule(loggerModuleConfig),
        new UnitOfWorkModule(),
      ],
    });

    bookService = container.get<BookService>(bookModuleSymbols.bookService);
    bookRepositoryFactory = container.get<BookRepositoryFactory>(bookModuleSymbols.bookRepositoryFactory);
    authorRepositoryFactory = container.get<AuthorRepositoryFactory>(authorSymbols.authorRepositoryFactory);
    authorBookRepositoryFactory = container.get<AuthorBookRepositoryFactory>(
      authorBookSymbols.authorBookRepositoryFactory,
    );
    bookCategoryRepositoryFactory = container.get<BookCategoryRepositoryFactory>(
      bookCategoryModuleSymbols.bookCategoryRepositoryFactory,
    );
    categoryRepositoryFactory = container.get<CategoryRepositoryFactory>(
      categoryModuleSymbols.categoryRepositoryFactory,
    );
    dataSource = container.get<DataSource>(postgresSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('Create book', () => {
    it('creates book in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { title, isbn, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const book = await bookService.createBook({
          unitOfWork,
          draft: {
            title,
            isbn,
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

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { id, title, isbn, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const book = await bookRepository.createOne({
          id,
          title,
          isbn,
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

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
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

        const book = await bookRepository.createOne({
          id: id1,
          title: title1,
          isbn: isbn1,
          releaseYear,
          language,
          format,
          price,
        });

        await bookRepository.createOne({
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

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { id: id1, title, isbn: isbn1, language, format, price } = bookEntityTestFactory.create();

        const { id: id2, title: title2, isbn: isbn2 } = bookEntityTestFactory.create();

        const { id: id3, title: title3, isbn: isbn3 } = bookEntityTestFactory.create();

        const book1 = await bookRepository.createOne({
          id: id1,
          title,
          isbn: isbn1,
          releaseYear: 1997,
          language,
          format,
          price,
        });

        const book2 = await bookRepository.createOne({
          id: id2,
          title: title2,
          isbn: isbn2,
          releaseYear: 1999,
          language,
          format,
          price,
        });

        await bookRepository.createOne({
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

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { id: id1, title, isbn: isbn1, language, releaseYear, format } = bookEntityTestFactory.create();

        const { id: id2, title: title2, isbn: isbn2 } = bookEntityTestFactory.create();

        const { id: id3, title: title3, isbn: isbn3 } = bookEntityTestFactory.create();

        const book1 = await bookRepository.createOne({
          id: id1,
          title,
          isbn: isbn1,
          releaseYear,
          language,
          format,
          price: 60,
        });

        const book2 = await bookRepository.createOne({
          id: id2,
          title: title2,
          isbn: isbn2,
          releaseYear,
          language,
          format,
          price: 50,
        });

        await bookRepository.createOne({
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

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { id: id1, title, isbn: isbn1, language, releaseYear, price } = bookEntityTestFactory.create();

        const { id: id2, title: title2, isbn: isbn2 } = bookEntityTestFactory.create();

        const { id: id3, title: title3, isbn: isbn3 } = bookEntityTestFactory.create();

        const book1 = await bookRepository.createOne({
          id: id1,
          title,
          isbn: isbn1,
          releaseYear,
          language,
          format: BookFormat.paperback,
          price,
        });

        const book2 = await bookRepository.createOne({
          id: id2,
          title: title2,
          isbn: isbn2,
          releaseYear,
          language,
          format: BookFormat.kindle,
          price,
        });

        await bookRepository.createOne({
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

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();
        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { id: id1, title, isbn, releaseYear, price, format } = bookEntityTestFactory.create();

        const { id: id2 } = bookEntityTestFactory.create();

        await bookRepository.createOne({
          id: id1,
          title,
          isbn,
          releaseYear,
          language: BookLanguage.en,
          format,
          price,
        });

        const polishBook = await bookRepository.createOne({
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

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { id: id1, title, isbn, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const { id: id2 } = bookEntityTestFactory.create();

        const { id: id3 } = bookEntityTestFactory.create();

        await bookRepository.createOne({
          id: id1,
          title,
          isbn,
          releaseYear,
          language,
          format,
          price,
        });

        await bookRepository.createOne({
          id: id2,
          title,
          isbn,
          releaseYear,
          language,
          format,
          price,
        });

        await bookRepository.createOne({
          id: id3,
          title,
          isbn,
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

        const book1 = await bookRepository.createOne({
          id: bookEntity1.id,
          format: bookEntity1.format,
          language: bookEntity1.language,
          price: bookEntity1.price,
          title: bookEntity1.title,
          isbn: bookEntity1.isbn,
          releaseYear: bookEntity1.releaseYear,
        });

        const book2 = await bookRepository.createOne({
          id: bookEntity2.id,
          format: bookEntity2.format,
          language: bookEntity2.language,
          price: bookEntity2.price,
          title: bookEntity2.title,
          isbn: bookEntity2.isbn,
          releaseYear: bookEntity2.releaseYear,
        });

        await bookRepository.createOne({
          id: bookEntity3.id,
          format: bookEntity3.format,
          language: bookEntity3.language,
          price: bookEntity3.price,
          title: bookEntity3.title,
          isbn: bookEntity3.isbn,
          releaseYear: bookEntity3.releaseYear,
        });

        const author = await authorRepository.createOne({
          id: authorEntity.id,
          firstName: authorEntity.firstName,
          lastName: authorEntity.lastName,
        });

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

        const category1 = await categoryRepository.createOne(categoryEntity1);

        const category2 = await categoryRepository.createOne(categoryEntity2);

        const book1 = await bookRepository.createOne({
          id: bookEntity1.id,
          format: bookEntity1.format,
          language: bookEntity1.language,
          price: bookEntity1.price,
          title: bookEntity1.title,
          isbn: bookEntity1.isbn,
          releaseYear: bookEntity1.releaseYear,
        });

        const book2 = await bookRepository.createOne({
          id: bookEntity2.id,
          format: bookEntity2.format,
          language: bookEntity2.language,
          price: bookEntity2.price,
          title: bookEntity2.title,
          isbn: bookEntity2.isbn,
          releaseYear: bookEntity2.releaseYear,
        });

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

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { id, title, isbn, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const newPrice = price + 1;

        const book = await bookRepository.createOne({
          id,
          title,
          isbn,
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

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
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

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { id, title, isbn, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const book = await bookRepository.createOne({
          id,
          title,
          isbn,
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

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
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
