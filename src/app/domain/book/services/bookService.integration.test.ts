import 'reflect-metadata';
import Container from 'typedi';
import { Container as ContainerFromExtensions } from 'typeorm-typedi-extensions';
import { createConnection, getConnection, useContainer } from 'typeorm';
import { Book } from '../entities/book';
import { BookRepository } from '../repositories/bookRepository';
import { BookService } from './bookService';
import { BookTestDataGenerator } from '../testDataGenerators/bookTestDataGenerator';

useContainer(ContainerFromExtensions);

describe('BookService', () => {
  let bookService: BookService;
  let bookRepository: BookRepository;
  let bookTestDataGenerator: BookTestDataGenerator;

  beforeAll(async () => {
    await createConnection({
      type: 'postgres',
      host: 'localhost',
      port: 6000,
      username: 'postgres',
      password: 'postgres',
      database: 'bookstoretest',
      entities: [Book],
      synchronize: true,
    }).catch((error) => {
      console.error(`Couldn't connect to the database!`);
      console.error(error);
    });

    bookService = Container.get(BookService);
    bookRepository = Container.get(BookRepository);

    bookTestDataGenerator = new BookTestDataGenerator();
  });

  afterAll(async () => {
    await getConnection().close();
  });

  afterEach(async () => {
    const entities = getConnection().entityMetadatas;
    for (const entity of entities) {
      const repository = await getConnection().getRepository(entity.name);
      await repository.query(`TRUNCATE ${entity.tableName} RESTART IDENTITY CASCADE;`);
    }
  });

  describe('Create book', () => {
    it('creates book in database', async () => {
      expect.assertions(1);

      const { title, author, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const createdBookDto = await bookService.createBook({
        title,
        author,
        releaseYear,
        language,
        format,
        price,
      });

      const bookDto = await bookRepository.findOneById(createdBookDto.id);

      expect(bookDto).not.toBeNull();
    });

    it('should not create book and throw if book with the same title and author already exists', async () => {
      expect.assertions(1);

      const { title, author, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      await bookRepository.createOne({
        title,
        author,
        releaseYear,
        language,
        format,
        price,
      });

      try {
        await bookService.createBook({
          title,
          author,
          releaseYear,
          language,
          format,
          price,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('Find book', () => {
    it('finds book by id in database', async () => {
      expect.assertions(1);

      const { title, author, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const book = await bookRepository.createOne({
        title,
        author,
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
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('Update book', () => {
    it('updates book in database', async () => {
      expect.assertions(2);

      const { title, author, releaseYear, language, format, price } = bookTestDataGenerator.generateData();
      const { price: newPrice } = bookTestDataGenerator.generateData();

      const book = await bookRepository.createOne({
        title,
        author,
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
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('Remove book', () => {
    it('removes book from database', async () => {
      expect.assertions(1);

      const { title, author, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const book = await bookRepository.createOne({
        title,
        author,
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
        expect(error).toBeInstanceOf(Error);
      }
    });
  });
});
