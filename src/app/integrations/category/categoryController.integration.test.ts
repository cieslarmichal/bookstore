import { ConfigLoader } from '../../../configLoader';
import { CategoryTestDataGenerator } from '../../domain/category/testDataGenerators/categoryTestDataGenerator';
import request from 'supertest';
import { App } from '../../../app';
import { createDependencyInjectionContainer, postgresConnector, UnitOfWorkModule } from '../../common';
import { PostgresModule } from '../../common';
import { CategoryModule } from '../../domain/category/categoryModule';
import { ControllersModule } from '../controllersModule';
import { BookModule } from '../../domain/book/bookModule';
import { Server } from '../../../server';
import { CategoryRepositoryFactory } from '../../domain/category/repositories/categoryRepositoryFactory';
import { UserEntityTestDataGenerator } from '../../domain/user/tests/userEntityTestDataGenerator/userEntityTestDataGenerator';
import { StatusCodes } from 'http-status-codes';
import { AuthHelper, TestTransactionExternalRunner } from '../../../integration/helpers';
import { UserModule } from '../../domain/user/userModule';
import { AuthorModule } from '../../domain/author/authorModule';
import { AuthorBookModule } from '../../domain/authorBook/authorBookModule';
import { LoggerModule } from '../../common/logger/loggerModule';
import { CATEGORY_REPOSITORY_FACTORY } from '../../domain/category/categorySymbols';
import { BookCategoryModule } from '../../domain/bookCategory/bookCategoryModule';
import { AddressModule } from '../../domain/address/addressModule';
import { CustomerModule } from '../../domain/customer/customerModule';

const baseUrl = '/categories';

describe(`CategoryController (${baseUrl})`, () => {
  let categoryRepositoryFactory: CategoryRepositoryFactory;
  let categoryTestDataGenerator: CategoryTestDataGenerator;
  let userTestDataGenerator: UserEntityTestDataGenerator;
  let server: Server;
  let authHelper: AuthHelper;
  let testTransactionRunner: TestTransactionExternalRunner;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    categoryTestDataGenerator = new CategoryTestDataGenerator();
    userTestDataGenerator = new UserEntityTestDataGenerator();
  });

  beforeEach(async () => {
    const container = await createDependencyInjectionContainer([
      PostgresModule,
      CategoryModule,
      BookModule,
      AuthorModule,
      UserModule,
      ControllersModule,
      AuthorBookModule,
      LoggerModule,
      BookCategoryModule,
      AddressModule,
      CustomerModule,
      UnitOfWorkModule,
    ]);

    categoryRepositoryFactory = container.resolve(CATEGORY_REPOSITORY_FACTORY);

    testTransactionRunner = new TestTransactionExternalRunner(container);

    authHelper = new AuthHelper(container);

    const app = new App(container);

    server = new Server(app.instance);

    server.listen();
  });

  afterEach(async () => {
    server.close();

    postgresConnector.closeConnection();
  });

  describe('Create category', () => {
    it('returns bad request when not all required properties in body are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userTestDataGenerator.generateData();

        const accessToken = authHelper.mockAuth({ userId, role });

        const response = await request(server.instance)
          .post(baseUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({});

        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
      });
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { name } = categoryTestDataGenerator.generateData();

        const response = await request(server.instance).post(baseUrl).send({
          name,
        });

        expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      });
    });

    it('accepts a request and returns created when all required body properties are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userTestDataGenerator.generateData();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { name } = categoryTestDataGenerator.generateData();

        const response = await request(server.instance)
          .post(baseUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            name,
          });

        expect(response.statusCode).toBe(StatusCodes.CREATED);
      });
    });
  });

  describe('Find category', () => {
    it('returns bad request the categoryId param is not uuid', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userTestDataGenerator.generateData();

        const accessToken = authHelper.mockAuth({ userId, role });

        const categoryId = 'abc';

        const response = await request(server.instance)
          .get(`${baseUrl}/${categoryId}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
      });
    });

    it('returns not found when category with given categoryId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { id: userId, role } = userTestDataGenerator.generateData();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { id } = categoryTestDataGenerator.generateData();

        const response = await request(server.instance)
          .get(`${baseUrl}/${id}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
      });
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const { name } = categoryTestDataGenerator.generateData();

        const category = await categoryRepository.createOne({ name });

        const response = await request(server.instance).get(`${baseUrl}/${category.id}`);

        expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      });
    });

    it('accepts a request and returns ok when categoryId is uuid and have corresponding category', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const categoryRepository = categoryRepositoryFactory.create(entityManager);

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
  });

  describe('Find categories', () => {
    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const response = await request(server.instance).get(`${baseUrl}`);

        expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      });
    });

    it('returns categories with filtering provided', async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const categoryRepository = categoryRepositoryFactory.create(entityManager);

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
  });

  describe('Remove category', () => {
    it('returns bad request when the categoryId param is not uuid', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userTestDataGenerator.generateData();

        const accessToken = authHelper.mockAuth({ userId, role });

        const categoryId = 'abc';

        const response = await request(server.instance)
          .delete(`${baseUrl}/${categoryId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send();

        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
      });
    });

    it('returns not found when category with given categoryId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userTestDataGenerator.generateData();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { id } = categoryTestDataGenerator.generateData();

        const response = await request(server.instance)
          .delete(`${baseUrl}/${id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send();

        expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
      });
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const { name } = categoryTestDataGenerator.generateData();

        const category = await categoryRepository.createOne({ name });

        const response = await request(server.instance).delete(`${baseUrl}/${category.id}`).send();

        expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      });
    });

    it('accepts a request and returns no content when categoryId is uuid and corresponds to existing category', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const categoryRepository = categoryRepositoryFactory.create(entityManager);

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
});
