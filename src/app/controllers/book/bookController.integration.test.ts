import { getConnection } from 'typeorm';
import { ConfigLoader } from '../../config';
import { BookTestDataGenerator } from '../../domain/book/testDataGenerators/bookTestDataGenerator';
import { AuthorTestDataGenerator } from '../../domain/author/testDataGenerators/authorTestDataGenerator';
import request from 'supertest';
import { BookService } from '../../domain/book/services/bookService';
import { App } from '../../../app';
import { createDIContainer } from '../../shared';
import { DbModule } from '../../shared';
import { BookModule } from '../../domain/book/bookModule';
import { ControllersModule } from '../controllersModule';
import { AuthorModule } from '../../domain/author/authorModule';
import { AuthorService } from '../../domain/author/services/authorService';

const baseUrl = '/v1/books';

describe(`BookController (${baseUrl})`, () => {
  let bookService: BookService;
  let authorService: AuthorService;
  let bookTestDataGenerator: BookTestDataGenerator;
  let authorTestDataGenerator: AuthorTestDataGenerator;
  let app: App;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([DbModule, BookModule, AuthorModule, ControllersModule]);

    bookService = container.resolve('bookService');
    authorService = container.resolve('authorService');

    bookTestDataGenerator = new BookTestDataGenerator();
    authorTestDataGenerator = new AuthorTestDataGenerator();
  });

  afterAll(async () => {
    await getConnection().close();
  });

  beforeEach(async () => {
    app = new App();
    app.run();
  });

  afterEach(async () => {
    app.stop();

    const entities = getConnection().entityMetadatas;
    for (const entity of entities) {
      const repository = getConnection().getRepository(entity.name);
      await repository.query(`TRUNCATE ${entity.tableName} RESTART IDENTITY CASCADE;`);
    }
  });

  describe('Create book', () => {
    it('return bad request when not all required properties in body are provided', async () => {
      expect.assertions(1);

      const { title } = bookTestDataGenerator.generateData();

      const response = await request(app.server).post(baseUrl).send({
        title,
      });

      expect(response.statusCode).toBe(400);
    });

    it('return internal server error when non existing authorId is provided', async () => {
      expect.assertions(1);

      const { title, authorId, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const response = await request(app.server).post(baseUrl).send({
        title,
        authorId,
        releaseYear,
        language,
        format,
        price,
      });

      expect(response.statusCode).toBe(500);
    });

    it('accepts a request and returns created when all required body properties are provided and author with given id exists', async () => {
      expect.assertions(1);

      const { firstName, lastName } = authorTestDataGenerator.generateData();

      const author = await authorService.createAuthor({ firstName, lastName });

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const response = await request(app.server).post(baseUrl).send({
        title,
        authorId: author.id,
        releaseYear,
        language,
        format,
        price,
      });

      expect(response.statusCode).toBe(201);
    });
  });

  describe('Find book', () => {
    it('return bad request the bookId param is not a number', async () => {
      expect.assertions(1);

      const bookId = 'abc';

      const response = await request(app.server).get(`${baseUrl}/${bookId}`);

      expect(response.statusCode).toBe(400);
    });

    it('return not found when book with given bookId does not exist', async () => {
      expect.assertions(1);

      const { id } = bookTestDataGenerator.generateData();

      const response = await request(app.server).get(`${baseUrl}/${id}`);

      expect(response.statusCode).toBe(404);
    });

    it('accepts a request and returns ok when bookId is a number and have corresponding book', async () => {
      expect.assertions(1);

      const { firstName, lastName } = authorTestDataGenerator.generateData();

      const author = await authorService.createAuthor({ firstName, lastName });

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const book = await bookService.createBook({ title, authorId: author.id, releaseYear, language, format, price });

      const response = await request(app.server).get(`${baseUrl}/${book.id}`);

      expect(response.statusCode).toBe(200);
    });
  });

  describe('Update book', () => {
    it('returns bad request when provided not allowed properties in body', async () => {
      expect.assertions(1);

      const { id, title } = bookTestDataGenerator.generateData();

      const response = await request(app.server).patch(`${baseUrl}/${id}`).send({
        title,
      });

      expect(response.statusCode).toBe(400);
    });

    it('returns bad request when the bookId param is not a number', async () => {
      expect.assertions(1);

      const bookId = 'abc';

      const { price } = bookTestDataGenerator.generateData();

      const response = await request(app.server).patch(`${baseUrl}/${bookId}`).send({
        price,
      });

      expect(response.statusCode).toBe(400);
    });

    it('return not found when book with given bookId does not exist', async () => {
      expect.assertions(1);

      const { id, price } = bookTestDataGenerator.generateData();

      const response = await request(app.server).patch(`${baseUrl}/${id}`).send({
        price,
      });

      expect(response.statusCode).toBe(404);
    });

    it('accepts a request and returns ok when bookId is a number and corresponds to existing book', async () => {
      expect.assertions(1);

      const { firstName, lastName } = authorTestDataGenerator.generateData();

      const author = await authorService.createAuthor({ firstName, lastName });

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const { price: newPrice } = bookTestDataGenerator.generateData();

      const book = await bookService.createBook({ title, authorId: author.id, releaseYear, language, format, price });

      const response = await request(app.server).patch(`${baseUrl}/${book.id}`).send({
        price: newPrice,
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('Remove book', () => {
    it('returns bad request when the bookId param is not a number', async () => {
      expect.assertions(1);

      const bookId = 'abc';

      const { price } = bookTestDataGenerator.generateData();

      const response = await request(app.server).delete(`${baseUrl}/${bookId}`).send({
        price,
      });

      expect(response.statusCode).toBe(400);
    });

    it('return not found when book with given bookId does not exist', async () => {
      expect.assertions(1);

      const { id, price } = bookTestDataGenerator.generateData();

      const response = await request(app.server).delete(`${baseUrl}/${id}`).send({
        price,
      });

      expect(response.statusCode).toBe(404);
    });

    it('accepts a request and returns ok when bookId is a number and corresponds to existing book', async () => {
      expect.assertions(1);

      const { firstName, lastName } = authorTestDataGenerator.generateData();

      const author = await authorService.createAuthor({ firstName, lastName });

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const book = await bookService.createBook({ title, authorId: author.id, releaseYear, language, format, price });

      const response = await request(app.server).delete(`${baseUrl}/${book.id}`);

      expect(response.statusCode).toBe(200);
    });
  });
});
