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
import { BookRepository } from '../../domain/book/repositories/bookRepository';
import { AuthorRepository } from '../../domain/author/repositories/authorRepository';
import { StatusCodes } from 'http-status-codes';
import { PostgresHelper } from '../../../integration/helpers/postgresHelper/postgresHelper';
import { AuthHelper } from '../../../integration/helpers';
import { UserTestDataGenerator } from '../../domain/user/testDataGenerators/userTestDataGenerator';

const baseUrl = '/books';

describe(`BookController (${baseUrl})`, () => {
  let bookRepository: BookRepository;
  let authorRepository: AuthorRepository;
  let bookTestDataGenerator: BookTestDataGenerator;
  let authorTestDataGenerator: AuthorTestDataGenerator;
  let userTestDataGenerator: UserTestDataGenerator;
  let server: Server;
  let authHelper: AuthHelper;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([DbModule, BookModule, AuthorModule, ControllersModule]);

    bookRepository = container.resolve('bookRepository');
    authorRepository = container.resolve('authorRepository');

    bookTestDataGenerator = new BookTestDataGenerator();
    authorTestDataGenerator = new AuthorTestDataGenerator();
    userTestDataGenerator = new UserTestDataGenerator();

    authHelper = new AuthHelper();
  });

  beforeEach(async () => {
    const app = new App();

    server = new Server(app.expressApp);

    server.listen();
  });

  afterEach(async () => {
    server.close();

    await PostgresHelper.removeDataFromTables();
  });

  describe('Create book', () => {
    it('returns bad request when not all required properties in body are provided', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const { title } = bookTestDataGenerator.generateData();

      const response = await request(server.server).post(baseUrl).set('Authorization', `Bearer ${accessToken}`).send({
        title,
      });

      expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    it('returns internal server error when non existing authorId is provided', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const { title, authorId, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const response = await request(server.server).post(baseUrl).set('Authorization', `Bearer ${accessToken}`).send({
        title,
        authorId,
        releaseYear,
        language,
        format,
        price,
      });

      expect(response.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    });

    it('returns unprocessable entity when book with given title and authorId already exists', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const { firstName, lastName } = authorTestDataGenerator.generateData();

      const author = await authorRepository.createOne({ firstName, lastName });

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      await bookRepository.createOne({ title, authorId: author.id, releaseYear, language, format, price });

      const response = await request(server.server).post(baseUrl).set('Authorization', `Bearer ${accessToken}`).send({
        title,
        authorId: author.id,
        releaseYear,
        language,
        format,
        price,
      });

      expect(response.statusCode).toBe(StatusCodes.UNPROCESSABLE_ENTITY);
    });

    it('returns unauthorized when access token is not provided', async () => {
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

      expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
    });

    it('accepts a request and returns created when all required body properties are provided and author with given id exists', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const { firstName, lastName } = authorTestDataGenerator.generateData();

      const author = await authorRepository.createOne({ firstName, lastName });

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const response = await request(server.server).post(baseUrl).set('Authorization', `Bearer ${accessToken}`).send({
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
    it('returns bad request the bookId param is not uuid', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const bookId = 'abc';

      const response = await request(server.server)
        .get(`${baseUrl}/${bookId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    it('returns not found when book with given bookId does not exist', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const { id } = bookTestDataGenerator.generateData();

      const response = await request(server.server)
        .get(`${baseUrl}/${id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const { firstName, lastName } = authorTestDataGenerator.generateData();

      const author = await authorRepository.createOne({ firstName, lastName });

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const book = await bookRepository.createOne({ title, authorId: author.id, releaseYear, language, format, price });

      const response = await request(server.server).get(`${baseUrl}/${book.id}`);

      expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
    });

    it('accepts a request and returns ok when bookId is uuid and have corresponding book', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const { firstName, lastName } = authorTestDataGenerator.generateData();

      const author = await authorRepository.createOne({ firstName, lastName });

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const book = await bookRepository.createOne({ title, authorId: author.id, releaseYear, language, format, price });

      const response = await request(server.server)
        .get(`${baseUrl}/${book.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(StatusCodes.OK);
    });
  });

  describe('Update book', () => {
    it('returns bad request when provided not allowed properties in body', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const { id, title } = bookTestDataGenerator.generateData();

      const response = await request(server.server)
        .patch(`${baseUrl}/${id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title,
        });

      expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    it('returns bad request when the bookId param is not uuid', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const bookId = 'abc';

      const { price } = bookTestDataGenerator.generateData();

      const response = await request(server.server)
        .patch(`${baseUrl}/${bookId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          price,
        });

      expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    it('returns not found when book with given bookId does not exist', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const { id, price } = bookTestDataGenerator.generateData();

      const response = await request(server.server)
        .patch(`${baseUrl}/${id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          price,
        });

      expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const { firstName, lastName } = authorTestDataGenerator.generateData();

      const author = await authorRepository.createOne({ firstName, lastName });

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const { price: newPrice } = bookTestDataGenerator.generateData();

      const book = await bookRepository.createOne({ title, authorId: author.id, releaseYear, language, format, price });

      const response = await request(server.server).patch(`${baseUrl}/${book.id}`).send({
        price: newPrice,
      });

      expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
    });

    it('accepts a request and returns ok when bookId is uuid and corresponds to existing book', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const { firstName, lastName } = authorTestDataGenerator.generateData();

      const author = await authorRepository.createOne({ firstName, lastName });

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const { price: newPrice } = bookTestDataGenerator.generateData();

      const book = await bookRepository.createOne({ title, authorId: author.id, releaseYear, language, format, price });

      const response = await request(server.server)
        .patch(`${baseUrl}/${book.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          price: newPrice,
        });

      expect(response.statusCode).toBe(StatusCodes.OK);
    });
  });

  describe('Remove book', () => {
    it('returns bad request when the bookId param is not uuid', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const bookId = 'abc';

      const response = await request(server.server)
        .delete(`${baseUrl}/${bookId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send();

      expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    it('returns not found when book with given bookId does not exist', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const { id } = bookTestDataGenerator.generateData();

      const response = await request(server.server)
        .delete(`${baseUrl}/${id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send();

      expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const { firstName, lastName } = authorTestDataGenerator.generateData();

      const author = await authorRepository.createOne({ firstName, lastName });

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const book = await bookRepository.createOne({ title, authorId: author.id, releaseYear, language, format, price });

      const response = await request(server.server).delete(`${baseUrl}/${book.id}`).send();

      expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
    });

    it('accepts a request and returns no content when bookId is uuid and corresponds to existing book', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const { firstName, lastName } = authorTestDataGenerator.generateData();

      const author = await authorRepository.createOne({ firstName, lastName });

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const book = await bookRepository.createOne({ title, authorId: author.id, releaseYear, language, format, price });

      const response = await request(server.server)
        .delete(`${baseUrl}/${book.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send();

      expect(response.statusCode).toBe(StatusCodes.NO_CONTENT);
    });
  });
});
