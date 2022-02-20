import 'reflect-metadata';
import Container from 'typedi';
import { Container as ContainerFromExtensions } from 'typeorm-typedi-extensions';
import { createConnection, getConnection, useContainer } from 'typeorm';
import { Book } from '../entities/book';
import { BookRepository } from '../repositories/bookRepository';
import { BookFormat, BookLanguage } from '../types';
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
    it('creates a book in database', async () => {
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

    it('should not create book if book with the same title and author already exists', async () => {
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
});
