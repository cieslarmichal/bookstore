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
import { CategoryTestDataGenerator } from '../../category/testDataGenerators/categoryTestDataGenerator';
import { CategoryModule } from '../../category/categoryModule';
import { CategoryRepository } from '../../category/repositories/categoryRepository';

describe('BookService', () => {
  let bookService: BookService;
  let bookRepository: BookRepository;
  let categoryRepository: CategoryRepository;
  let bookTestDataGenerator: BookTestDataGenerator;
  let categoryTestDataGenerator: CategoryTestDataGenerator;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([DbModule, BookModule, AuthorModule, CategoryModule]);

    bookService = container.resolve('bookService');
    bookRepository = container.resolve('bookRepository');
    categoryRepository = container.resolve('categoryRepository');

    bookTestDataGenerator = new BookTestDataGenerator();
    categoryTestDataGenerator = new CategoryTestDataGenerator();
  });

  afterEach(async () => {
    await PostgresHelper.removeDataFromTables();
  });

  describe('Create book', () => {
    it('creates book in database', async () => {
      expect.assertions(1);

      const { name } = categoryTestDataGenerator.generateData();

      const category = await categoryRepository.createOne({ name });

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const createdBookDto = await bookService.createBook({
        title,
        releaseYear,
        language,
        format,
        price,
        categoryId: category.id,
      });

      const bookDto = await bookRepository.findOneById(createdBookDto.id);

      expect(bookDto).not.toBeNull();
    });
  });

  describe('Find book', () => {
    it('finds book by id in database', async () => {
      expect.assertions(1);

      const { name } = categoryTestDataGenerator.generateData();

      const category = await categoryRepository.createOne({ name });

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const book = await bookRepository.createOne({
        title,
        releaseYear,
        language,
        format,
        price,
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

      const { name } = categoryTestDataGenerator.generateData();

      const category = await categoryRepository.createOne({ name });

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const book = await bookRepository.createOne({
        title,
        releaseYear,
        language,
        format,
        price,
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
