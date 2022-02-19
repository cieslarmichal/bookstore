import Container from 'typedi';
import { createConnection, getConnection } from 'typeorm';
import { Book } from '../entities/book';
import { BookRepository } from '../repositories/bookRepository';
import { BookFormat, BookLanguage } from '../types';
import { BookService } from './bookService';

describe('BookService', () => {
  let bookService: BookService;
  let bookRepository: BookRepository;

  beforeAll(async () => {
    (async () => {
      await createConnection({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'postgres',
        database: 'bookstoretest',
        entities: [Book],
        synchronize: true,
      });

      console.log('Connected to postgres database on port 5432');
    })();
  });

  beforeEach(async () => {
    bookService = Container.get(BookService);
    bookRepository = Container.get(BookRepository);
  });

  afterAll(async () => {
    const connection = await getConnection();
    await connection.close();
  });

  describe('Create book', () => {
    it('creates a book in database', async () => {
      expect.assertions(4);

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
