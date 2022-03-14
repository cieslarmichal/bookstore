import { ConfigLoader } from '../../../configLoader';
import { BookTestDataGenerator } from '../../domain/book/testDataGenerators/bookTestDataGenerator';
import request from 'supertest';
import { App } from '../../../app';
import { createDIContainer } from '../../shared';
import { DbModule } from '../../shared';
import { BookModule } from '../../domain/book/bookModule';
import { ControllersModule } from '../controllersModule';
import { AuthorModule } from '../../domain/author/authorModule';
import { Server } from '../../../server';
import { BookRepository } from '../../domain/book/repositories/bookRepository';
import { StatusCodes } from 'http-status-codes';
import { PostgresHelper } from '../../../integration/helpers/postgresHelper/postgresHelper';
import { AuthHelper } from '../../../integration/helpers';
import { UserTestDataGenerator } from '../../domain/user/testDataGenerators/userTestDataGenerator';
import { UserModule } from '../../domain/user/userModule';
import { CategoryTestDataGenerator } from '../../domain/category/testDataGenerators/categoryTestDataGenerator';
import { CategoryRepository } from '../../domain/category/repositories/categoryRepository';
import { CategoryModule } from '../../domain/category/categoryModule';
import { AuthorBookModule } from '../../domain/authorBook/authorBookModule';
import { LoggerModule } from '../../shared/logger/loggerModule';
import { BOOK_REPOSITORY } from '../../domain/book/bookInjectionSymbols';
import { CATEGORY_REPOSITORY } from '../../domain/category/categoryInjectionSymbols';

const baseUrl = '/books';

describe(`BookController (${baseUrl})`, () => {
  let bookRepository: BookRepository;
  let categoryRepository: CategoryRepository;
  let bookTestDataGenerator: BookTestDataGenerator;
  let categoryTestDataGenerator: CategoryTestDataGenerator;
  let userTestDataGenerator: UserTestDataGenerator;
  let server: Server;
  let authHelper: AuthHelper;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    bookTestDataGenerator = new BookTestDataGenerator();
    userTestDataGenerator = new UserTestDataGenerator();
    categoryTestDataGenerator = new CategoryTestDataGenerator();
  });

  beforeEach(async () => {
    const container = await createDIContainer([
      DbModule,
      CategoryModule,
      BookModule,
      AuthorModule,
      UserModule,
      ControllersModule,
      AuthorBookModule,
      LoggerModule,
    ]);

    bookRepository = container.resolve(BOOK_REPOSITORY);
    categoryRepository = container.resolve(CATEGORY_REPOSITORY);

    authHelper = new AuthHelper(container);

    const app = new App(container);

    server = new Server(app.instance);

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

      const response = await request(server.instance).post(baseUrl).set('Authorization', `Bearer ${accessToken}`).send({
        title,
      });

      expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const { name } = categoryTestDataGenerator.generateData();

      const category = await categoryRepository.createOne({ name });

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const response = await request(server.instance).post(baseUrl).send({
        title,
        categoryId: category.id,
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

      const { name } = categoryTestDataGenerator.generateData();

      const category = await categoryRepository.createOne({ name });

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const response = await request(server.instance).post(baseUrl).set('Authorization', `Bearer ${accessToken}`).send({
        title,
        categoryId: category.id,
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

      const response = await request(server.instance)
        .get(`${baseUrl}/${bookId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    it('returns not found when book with given bookId does not exist', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const { id } = bookTestDataGenerator.generateData();

      const response = await request(server.instance)
        .get(`${baseUrl}/${id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const { name } = categoryTestDataGenerator.generateData();

      const category = await categoryRepository.createOne({ name });

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const book = await bookRepository.createOne({
        title,
        categoryId: category.id,
        releaseYear,
        language,
        format,
        price,
      });

      const response = await request(server.instance).get(`${baseUrl}/${book.id}`);

      expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
    });

    it('accepts a request and returns ok when bookId is uuid and have corresponding book', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const { name } = categoryTestDataGenerator.generateData();

      const category = await categoryRepository.createOne({ name });

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const book = await bookRepository.createOne({
        title,
        categoryId: category.id,
        releaseYear,
        language,
        format,
        price,
      });

      const response = await request(server.instance)
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

      const response = await request(server.instance)
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

      const response = await request(server.instance)
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

      const response = await request(server.instance)
        .patch(`${baseUrl}/${id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          price,
        });

      expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const { name } = categoryTestDataGenerator.generateData();

      const category = await categoryRepository.createOne({ name });

      const { price: newPrice } = bookTestDataGenerator.generateData();

      const book = await bookRepository.createOne({
        title,
        categoryId: category.id,
        releaseYear,
        language,
        format,
        price,
      });

      const response = await request(server.instance).patch(`${baseUrl}/${book.id}`).send({
        price: newPrice,
      });

      expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
    });

    it('accepts a request and returns ok when bookId is uuid and corresponds to existing book', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const { name } = categoryTestDataGenerator.generateData();

      const category = await categoryRepository.createOne({ name });

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const { price: newPrice } = bookTestDataGenerator.generateData();

      const book = await bookRepository.createOne({
        title,
        categoryId: category.id,
        releaseYear,
        language,
        format,
        price,
      });

      const response = await request(server.instance)
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

      const response = await request(server.instance)
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

      const response = await request(server.instance)
        .delete(`${baseUrl}/${id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send();

      expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const { name } = categoryTestDataGenerator.generateData();

      const category = await categoryRepository.createOne({ name });

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const book = await bookRepository.createOne({
        title,
        categoryId: category.id,
        releaseYear,
        language,
        format,
        price,
      });

      const response = await request(server.instance).delete(`${baseUrl}/${book.id}`).send();

      expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
    });

    it('accepts a request and returns no content when bookId is uuid and corresponds to existing book', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const { name } = categoryTestDataGenerator.generateData();

      const category = await categoryRepository.createOne({ name });

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const book = await bookRepository.createOne({
        title,
        categoryId: category.id,
        releaseYear,
        language,
        format,
        price,
      });

      const response = await request(server.instance)
        .delete(`${baseUrl}/${book.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send();

      expect(response.statusCode).toBe(StatusCodes.NO_CONTENT);
    });
  });
});
