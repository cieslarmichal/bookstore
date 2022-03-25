import { ConfigLoader } from '../../../configLoader';
import { CategoryTestDataGenerator } from '../../domain/category/testDataGenerators/categoryTestDataGenerator';
import request from 'supertest';
import { App } from '../../../app';
import { createDIContainer } from '../../shared';
import { DbModule } from '../../shared';
import { CategoryModule } from '../../domain/category/categoryModule';
import { ControllersModule } from '../controllersModule';
import { BookModule } from '../../domain/book/bookModule';
import { Server } from '../../../server';
import { CategoryRepository } from '../../domain/category/repositories/categoryRepository';
import { UserTestDataGenerator } from '../../domain/user/testDataGenerators/userTestDataGenerator';
import { StatusCodes } from 'http-status-codes';
import { PostgresHelper } from '../../../integration/helpers/postgresHelper/postgresHelper';
import { AuthHelper } from '../../../integration/helpers';
import { UserModule } from '../../domain/user/userModule';
import { AuthorModule } from '../../domain/author/authorModule';
import { AuthorBookModule } from '../../domain/authorBook/authorBookModule';
import { LoggerModule } from '../../shared/logger/loggerModule';
import { CATEGORY_REPOSITORY } from '../../domain/category/categoryInjectionSymbols';
import { BookCategoryModule } from '../../domain/bookCategory/bookCategoryModule';

const baseUrl = '/categories';

describe(`CategoryController (${baseUrl})`, () => {
  let categoryRepository: CategoryRepository;
  let categoryTestDataGenerator: CategoryTestDataGenerator;
  let userTestDataGenerator: UserTestDataGenerator;
  let server: Server;
  let authHelper: AuthHelper;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    categoryTestDataGenerator = new CategoryTestDataGenerator();
    userTestDataGenerator = new UserTestDataGenerator();
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
      BookCategoryModule,
    ]);

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

  describe('Create category', () => {
    it('returns bad request when not all required properties in body are provided', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const response = await request(server.instance)
        .post(baseUrl)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const { name } = categoryTestDataGenerator.generateData();

      const response = await request(server.instance).post(baseUrl).send({
        name,
      });

      expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
    });

    it('accepts a request and returns created when all required body properties are provided', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const { name } = categoryTestDataGenerator.generateData();

      const response = await request(server.instance).post(baseUrl).set('Authorization', `Bearer ${accessToken}`).send({
        name,
      });

      expect(response.statusCode).toBe(StatusCodes.CREATED);
    });
  });

  describe('Find category', () => {
    it('returns bad request the categoryId param is not uuid', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const categoryId = 'abc';

      const response = await request(server.instance)
        .get(`${baseUrl}/${categoryId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    it('returns not found when category with given categoryId does not exist', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const { id } = categoryTestDataGenerator.generateData();

      const response = await request(server.instance)
        .get(`${baseUrl}/${id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const { name } = categoryTestDataGenerator.generateData();

      const category = await categoryRepository.createOne({ name });

      const response = await request(server.instance).get(`${baseUrl}/${category.id}`);

      expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
    });

    it('accepts a request and returns ok when categoryId is uuid and have corresponding category', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const { name } = categoryTestDataGenerator.generateData();

      const category = await categoryRepository.createOne({ name });

      const response = await request(server.instance)
        .get(`${baseUrl}/${category.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(StatusCodes.OK);
    });
  });

  describe('Find categories', () => {
    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const response = await request(server.instance).get(`${baseUrl}`);

      expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
    });

    it('returns categories with filtering provided', async () => {
      expect.assertions(2);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const { name } = categoryTestDataGenerator.generateData();

      await categoryRepository.createOne({ name });

      const { name: otherName } = categoryTestDataGenerator.generateData();

      await categoryRepository.createOne({ name: otherName });

      const response = await request(server.instance)
        .get(`${baseUrl}?filter=["name||eq||${name}"]`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(StatusCodes.OK);
      expect(response.body.data.categories.length).toBe(1);
    });
  });

  describe('Remove category', () => {
    it('returns bad request when the categoryId param is not uuid', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const categoryId = 'abc';

      const response = await request(server.instance)
        .delete(`${baseUrl}/${categoryId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send();

      expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    it('returns not found when category with given categoryId does not exist', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const { id } = categoryTestDataGenerator.generateData();

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

      const response = await request(server.instance).delete(`${baseUrl}/${category.id}`).send();

      expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
    });

    it('accepts a request and returns no content when categoryId is uuid and corresponds to existing category', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const { name } = categoryTestDataGenerator.generateData();

      const category = await categoryRepository.createOne({ name });

      const response = await request(server.instance)
        .delete(`${baseUrl}/${category.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send();

      expect(response.statusCode).toBe(StatusCodes.NO_CONTENT);
    });
  });
});
