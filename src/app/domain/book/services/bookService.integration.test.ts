import { BookRepository } from '../repositories/bookRepository';
import { BookService } from './bookService';
import { BookTestDataGenerator } from '../testDataGenerators/bookTestDataGenerator';
import { ConfigLoader } from '../../../../configLoader';
import { createDIContainer } from '../../../shared';
import { DbModule } from '../../../shared';
import { BookModule } from '../bookModule';
import { AuthorTestDataGenerator } from '../../author/testDataGenerators/authorTestDataGenerator';
import { AuthorModule } from '../../author/authorModule';
import { AuthorRepository } from '../../author/repositories/authorRepository';
import { BookAlreadyExists, BookNotFound } from '../errors';
import { PostgresHelper } from '../../../../integration/helpers/postgresHelper/postgresHelper';
import { CategoryTestDataGenerator } from '../../category/testDataGenerators/categoryTestDataGenerator';
import { CategoryModule } from '../../category/categoryModule';
import { CategoryRepository } from '../../category/repositories/categoryRepository';

describe('BookService', () => {
  let bookService: BookService;
  let authorRepository: AuthorRepository;
  let bookRepository: BookRepository;
  let categoryRepository: CategoryRepository;
  let bookTestDataGenerator: BookTestDataGenerator;
  let authorTestDataGenerator: AuthorTestDataGenerator;
  let categoryTestDataGenerator: CategoryTestDataGenerator;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([DbModule, BookModule, AuthorModule, CategoryModule]);

    bookService = container.resolve('bookService');
    authorRepository = container.resolve('authorRepository');
    bookRepository = container.resolve('bookRepository');
    categoryRepository = container.resolve('categoryRepository');

    bookTestDataGenerator = new BookTestDataGenerator();
    authorTestDataGenerator = new AuthorTestDataGenerator();
    categoryTestDataGenerator = new CategoryTestDataGenerator();
  });

  afterEach(async () => {
    await PostgresHelper.removeDataFromTables();
  });

  describe('Create book', () => {
    it('creates book in database', async () => {
      expect.assertions(1);

      const { firstName, lastName } = authorTestDataGenerator.generateData();

      const author = await authorRepository.createOne({ firstName, lastName });

      const { name } = categoryTestDataGenerator.generateData();

      const category = await categoryRepository.createOne({ name });

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const createdBookDto = await bookService.createBook({
        title,
        releaseYear,
        language,
        format,
        price,
        authorId: author.id,
        categoryId: category.id,
      });

      const bookDto = await bookRepository.findOneById(createdBookDto.id);

      expect(bookDto).not.toBeNull();
    });

    it('should not create book and throw if book with the same title and author already exists', async () => {
      expect.assertions(1);

      const { firstName, lastName } = authorTestDataGenerator.generateData();

      const author = await authorRepository.createOne({ firstName, lastName });

      const { name } = categoryTestDataGenerator.generateData();

      const category = await categoryRepository.createOne({ name });

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      await bookRepository.createOne({
        title,
        releaseYear,
        language,
        format,
        price,
        authorId: author.id,
        categoryId: category.id,
      });

      try {
        await bookService.createBook({
          title,
          releaseYear,
          language,
          format,
          price,
          authorId: author.id,
          categoryId: category.id,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(BookAlreadyExists);
      }
    });
  });

  describe('Find book', () => {
    it('finds book by id in database', async () => {
      expect.assertions(1);

      const { firstName, lastName } = authorTestDataGenerator.generateData();

      const author = await authorRepository.createOne({ firstName, lastName });

      const { name } = categoryTestDataGenerator.generateData();

      const category = await categoryRepository.createOne({ name });

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const book = await bookRepository.createOne({
        title,
        releaseYear,
        language,
        format,
        price,
        authorId: author.id,
        categoryId: category.id,
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

  describe('Update book', () => {
    it('updates book in database', async () => {
      expect.assertions(2);

      const { firstName, lastName } = authorTestDataGenerator.generateData();

      const author = await authorRepository.createOne({ firstName, lastName });

      const { name } = categoryTestDataGenerator.generateData();

      const category = await categoryRepository.createOne({ name });

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const { price: newPrice } = bookTestDataGenerator.generateData();

      const book = await bookRepository.createOne({
        title,
        releaseYear,
        language,
        format,
        price,
        authorId: author.id,
        categoryId: category.id,
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

      const { firstName, lastName } = authorTestDataGenerator.generateData();

      const author = await authorRepository.createOne({ firstName, lastName });

      const { name } = categoryTestDataGenerator.generateData();

      const category = await categoryRepository.createOne({ name });

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const book = await bookRepository.createOne({
        title,
        releaseYear,
        language,
        format,
        price,
        authorId: author.id,
        categoryId: category.id,
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
