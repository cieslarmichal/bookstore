import { BookRepository } from '../repositories/bookRepository';
import { BookService } from './bookService';
import { BookTestDataGenerator } from '../testDataGenerators/bookTestDataGenerator';
import { ConfigLoader } from '../../../../configLoader';
import { createDIContainer } from '../../../shared';
import { DbModule } from '../../../shared';
import { BookModule } from '../bookModule';
import { AuthorModule } from '../../author/authorModule';
import { BookNotFound } from '../errors';
import { PostgresHelper } from '../../../../integration/helpers/postgresHelper/postgresHelper';
import { CategoryModule } from '../../category/categoryModule';
import { AuthorRepository } from '../../author/repositories/authorRepository';
import { AuthorTestDataGenerator } from '../../author/testDataGenerators/authorTestDataGenerator';
import { AuthorBookRepository } from '../../authorBook/repositories/authorBookRepository';
import { AuthorBookModule } from '../../authorBook/authorBookModule';
import { LoggerModule } from '../../../shared/logger/loggerModule';
import { BOOK_REPOSITORY, BOOK_SERVICE } from '../bookInjectionSymbols';
import { AUTHOR_REPOSITORY } from '../../author/authorInjectionSymbols';
import { AUTHOR_BOOK_REPOSITORY } from '../../authorBook/authorBookInjectionSymbols';

describe('BookService', () => {
  let bookService: BookService;
  let bookRepository: BookRepository;
  let authorRepository: AuthorRepository;
  let authorBookRepository: AuthorBookRepository;
  let bookTestDataGenerator: BookTestDataGenerator;
  let authorTestDataGenerator: AuthorTestDataGenerator;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([
      DbModule,
      BookModule,
      AuthorModule,
      AuthorBookModule,
      CategoryModule,
      LoggerModule,
    ]);

    bookService = container.resolve(BOOK_SERVICE);
    bookRepository = container.resolve(BOOK_REPOSITORY);
    authorRepository = container.resolve(AUTHOR_REPOSITORY);
    authorBookRepository = container.resolve(AUTHOR_BOOK_REPOSITORY);

    bookTestDataGenerator = new BookTestDataGenerator();
    authorTestDataGenerator = new AuthorTestDataGenerator();
  });

  afterEach(async () => {
    await PostgresHelper.removeDataFromTables();
  });

  describe('Create book', () => {
    it('creates book in database', async () => {
      expect.assertions(1);

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const createdBookDto = await bookService.createBook({
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

  describe('Find book', () => {
    it('finds book by id in database', async () => {
      expect.assertions(1);

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const book = await bookRepository.createOne({
        title,
        releaseYear,
        language,
        format,
        price,
      });

      const foundBook = await bookService.findBook(book.id);

      expect(foundBook).not.toBeNull();
    });

    it('should throw if book with given id does not exist in db', async () => {
      expect.assertions(1);

      const { id } = bookTestDataGenerator.generateData();

      try {
        await bookService.findBook(id);
      } catch (error) {
        expect(error).toBeInstanceOf(BookNotFound);
      }
    });
  });

  describe('Find books', () => {
    it('finds books by condition in database', async () => {
      expect.assertions(2);

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

      const foundBooks = await bookService.findBooks({ title: { eq: title } }, { page: 1, limit: 5 });

      expect(foundBooks.length).toBe(1);
      expect(foundBooks[0]).toStrictEqual(book);
    });

    it('finds books by two conditions in database', async () => {
      expect.assertions(2);

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      await bookRepository.createOne({
        title,
        releaseYear,
        language,
        format,
        price,
      });

      const { title: title2, releaseYear: otherReleaseYear } = bookTestDataGenerator.generateData();

      const book = await bookRepository.createOne({
        title: title2,
        releaseYear: otherReleaseYear,
        language,
        format,
        price,
      });

      const { title: title3 } = bookTestDataGenerator.generateData();

      await bookRepository.createOne({
        title: title3,
        releaseYear: otherReleaseYear,
        language,
        format,
        price,
      });

      const foundBooks = await bookService.findBooks(
        { releaseYear: { eq: otherReleaseYear }, title: { eq: title2 } },
        { page: 1, limit: 5 },
      );

      expect(foundBooks.length).toBe(1);
      expect(foundBooks[0]).toStrictEqual(book);
    });

    it('finds books in database limited by pagination', async () => {
      expect.assertions(1);

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

      const foundBooks = await bookService.findBooks({}, { page: 1, limit: 2 });

      expect(foundBooks.length).toBe(2);
    });
  });

  describe('Find books by author id', () => {
    it('finds books by author id in database', async () => {
      expect.assertions(4);

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

      const foundBooks = await bookService.findBooksByAuthorId(author.id);

      expect(foundBooks).not.toBeNull();
      expect(foundBooks.length).toBe(2);
      expect(foundBooks[0].title).toBe(firstBook.title);
      expect(foundBooks[1].title).toBe(secondBook.title);
    });
  });

  describe('Update book', () => {
    it('updates book in database', async () => {
      expect.assertions(2);

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const { price: newPrice } = bookTestDataGenerator.generateData();

      const book = await bookRepository.createOne({
        title,
        releaseYear,
        language,
        format,
        price,
      });

      const updatedBook = await bookService.updateBook(book.id, { price: newPrice });

      expect(updatedBook).not.toBeNull();
      expect(updatedBook.price).toBe(newPrice);
    });

    it('should not update book and throw if book with given id does not exist', async () => {
      expect.assertions(1);

      const { id, price } = bookTestDataGenerator.generateData();

      try {
        await bookService.updateBook(id, { price });
      } catch (error) {
        expect(error).toBeInstanceOf(BookNotFound);
      }
    });
  });

  describe('Remove book', () => {
    it('removes book from database', async () => {
      expect.assertions(1);

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const book = await bookRepository.createOne({
        title,
        releaseYear,
        language,
        format,
        price,
      });

      await bookService.removeBook(book.id);

      const bookDto = await bookRepository.findOneById(book.id);

      expect(bookDto).toBeNull();
    });

    it('should throw if book with given id does not exist', async () => {
      expect.assertions(1);

      const { id } = bookTestDataGenerator.generateData();

      try {
        await bookService.removeBook(id);
      } catch (error) {
        expect(error).toBeInstanceOf(BookNotFound);
      }
    });
  });
});
