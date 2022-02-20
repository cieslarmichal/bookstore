import 'reflect-metadata';
import Container from 'typedi';
import { Container as ContainerFromExtensions } from 'typeorm-typedi-extensions';
import { createConnection, getConnection, useContainer } from 'typeorm';
import { Book } from '../entities/book';
import { BookRepository } from '../repositories/bookRepository';
import { BookFormat, BookLanguage } from '../types';
import { BookService } from './bookService';

useContainer(ContainerFromExtensions);

describe('BookService', () => {
  let bookService: BookService;
  let bookRepository: BookRepository;

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

      const createdBookDto = await bookService.createBook({
        title: 'title',
        author: 'author',
        releaseYear: 1992,
        language: BookLanguage.en,
        format: BookFormat.paperback,
        price: 20,
      });

      const bookDto = await bookRepository.findOneById(createdBookDto.id);

      expect(bookDto).not.toBeNull();
    });

    it('should not create book if book with the same title and author already exists', async () => {
      expect.assertions(1);

      await bookRepository.createOne({
        title: 'title',
        author: 'author',
        releaseYear: 1992,
        language: BookLanguage.en,
        format: BookFormat.paperback,
        price: 20,
      });

      try {
        await bookService.createBook({
          title: 'title',
          author: 'author',
          releaseYear: 1992,
          language: BookLanguage.en,
          format: BookFormat.paperback,
          price: 20,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });
});
