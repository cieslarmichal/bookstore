import { ConfigLoader } from '../../config';
import { BookTestDataGenerator } from '../../domain/book/testDataGenerators/bookTestDataGenerator';
import { AuthorTestDataGenerator } from '../../domain/author/testDataGenerators/authorTestDataGenerator';
import request from 'supertest';
import { App } from '../../../app';
import { createDIContainer } from '../../shared';
import { DbModule } from '../../shared';
import { BookModule } from '../../domain/book/bookModule';
import { ControllersModule } from '../controllersModule';
import { AuthorModule } from '../../domain/author/authorModule';
import { Server } from '../../../server';
import { dbManager } from '../../shared';
import { BookRepository } from '../../domain/book/repositories/bookRepository';
import { AuthorRepository } from '../../domain/author/repositories/authorRepository';
import { StatusCodes } from 'http-status-codes';

const baseUrl = '/books';

describe(`BookController (${baseUrl})`, () => {
  let bookRepository: BookRepository;
  let authorRepository: AuthorRepository;
  let bookTestDataGenerator: BookTestDataGenerator;
  let authorTestDataGenerator: AuthorTestDataGenerator;
  let server: Server;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([DbModule, BookModule, AuthorModule, ControllersModule]);

    bookRepository = container.resolve('bookRepository');
    authorRepository = container.resolve('authorRepository');

    bookTestDataGenerator = new BookTestDataGenerator();
    authorTestDataGenerator = new AuthorTestDataGenerator();
  });

  beforeEach(async () => {
    const app = new App();

    server = new Server(app.expressApp);

    server.listen();
  });

  afterEach(async () => {
    server.close();

    await dbManager.removeDataFromTables();
  });

  describe('Create book', () => {
    it('returns bad request when not all required properties in body are provided', async () => {
      expect.assertions(1);

      const { title } = bookTestDataGenerator.generateData();

      const response = await request(server.server).post(baseUrl).send({
        title,
      });

      expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    it('returns bad request when non existing authorId is provided', async () => {
      expect.assertions(1);

      const { title, authorId, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const response = await request(server.server).post(baseUrl).send({
        title,
        authorId,
        releaseYear,
        language,
        format,
        price,
      });

      expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    it('returns unprocessable entity when book with given title and authorId already exists', async () => {
      expect.assertions(1);

      const { firstName, lastName } = authorTestDataGenerator.generateData();

      const author = await authorRepository.createOne({ firstName, lastName });

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      await bookRepository.createOne({ title, authorId: author.id, releaseYear, language, format, price });

      const response = await request(server.server).post(baseUrl).send({
        title,
        authorId: author.id,
        releaseYear,
        language,
        format,
        price,
      });

      expect(response.statusCode).toBe(StatusCodes.UNPROCESSABLE_ENTITY);
    });

    it('accepts a request and returns created when all required body properties are provided and author with given id exists', async () => {
      expect.assertions(1);

      const { firstName, lastName } = authorTestDataGenerator.generateData();

      const author = await authorRepository.createOne({ firstName, lastName });

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const response = await request(server.server).post(baseUrl).send({
        title,
        authorId: author.id,
        releaseYear,
        language,
        format,
        price,
      });

      expect(response.statusCode).toBe(StatusCodes.CREATED);
    });
  });

  describe('Find book', () => {
    it('returns bad request the bookId param is not a number', async () => {
      expect.assertions(1);

      const bookId = 'abc';

      const response = await request(server.server).get(`${baseUrl}/${bookId}`);

      expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    it('returns not found when book with given bookId does not exist', async () => {
      expect.assertions(1);

      const { id } = bookTestDataGenerator.generateData();

      const response = await request(server.server).get(`${baseUrl}/${id}`);

      expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
    });

    it('accepts a request and returns ok when bookId is a number and have corresponding book', async () => {
      expect.assertions(1);

      const { firstName, lastName } = authorTestDataGenerator.generateData();

      const author = await authorRepository.createOne({ firstName, lastName });

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const book = await bookRepository.createOne({ title, authorId: author.id, releaseYear, language, format, price });

      const response = await request(server.server).get(`${baseUrl}/${book.id}`);

      expect(response.statusCode).toBe(StatusCodes.OK);
    });
  });

  describe('Update book', () => {
    it('returns bad request when provided not allowed properties in body', async () => {
      expect.assertions(1);

      const { id, title } = bookTestDataGenerator.generateData();

      const response = await request(server.server).patch(`${baseUrl}/${id}`).send({
        title,
      });

      expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    it('returns bad request when the bookId param is not a number', async () => {
      expect.assertions(1);

      const bookId = 'abc';

      const { price } = bookTestDataGenerator.generateData();

      const response = await request(server.server).patch(`${baseUrl}/${bookId}`).send({
        price,
      });

      expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    it('returns not found when book with given bookId does not exist', async () => {
      expect.assertions(1);

      const { id, price } = bookTestDataGenerator.generateData();

      const response = await request(server.server).patch(`${baseUrl}/${id}`).send({
        price,
      });

      expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
    });

    it('accepts a request and returns ok when bookId is a number and corresponds to existing book', async () => {
      expect.assertions(1);

      const { firstName, lastName } = authorTestDataGenerator.generateData();

      const author = await authorRepository.createOne({ firstName, lastName });

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const { price: newPrice } = bookTestDataGenerator.generateData();

      const book = await bookRepository.createOne({ title, authorId: author.id, releaseYear, language, format, price });

      const response = await request(server.server).patch(`${baseUrl}/${book.id}`).send({
        price: newPrice,
      });

      expect(response.statusCode).toBe(StatusCodes.OK);
    });
  });

  describe('Remove book', () => {
    it('returns bad request when the bookId param is not a number', async () => {
      expect.assertions(1);

      const bookId = 'abc';

      const { price } = bookTestDataGenerator.generateData();

      const response = await request(server.server).delete(`${baseUrl}/${bookId}`).send({
        price,
      });

      expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    it('returns not found when book with given bookId does not exist', async () => {
      expect.assertions(1);

      const { id, price } = bookTestDataGenerator.generateData();

      const response = await request(server.server).delete(`${baseUrl}/${id}`).send({
        price,
      });

      expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
    });

    it('accepts a request and returns ok when bookId is a number and corresponds to existing book', async () => {
      expect.assertions(1);

      const { firstName, lastName } = authorTestDataGenerator.generateData();

      const author = await authorRepository.createOne({ firstName, lastName });

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const book = await bookRepository.createOne({ title, authorId: author.id, releaseYear, language, format, price });

      const response = await request(server.server).delete(`${baseUrl}/${book.id}`);

      expect(response.statusCode).toBe(StatusCodes.OK);
    });
  });
});
