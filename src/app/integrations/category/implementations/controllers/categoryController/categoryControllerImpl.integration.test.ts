import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { App } from '../../../../../../app';
import { ConfigLoader } from '../../../../../../configLoader';
import { AddressModule } from '../../../../../domain/address/addressModule';
import { AuthorModule } from '../../../../../domain/author/authorModule';
import { AuthorBookModule } from '../../../../../domain/authorBook/authorBookModule';
import { BookModule } from '../../../../../domain/book/bookModule';
import { BookCategoryModule } from '../../../../../domain/bookCategory/bookCategoryModule';
import { CategoryModule } from '../../../../../domain/category/categoryModule';
import { CategoryRepositoryFactory } from '../../../../../domain/category/contracts/factories/categoryRepositoryFactory/categoryRepositoryFactory';
import { CategoryEntityTestFactory } from '../../../../../domain/category/tests/factories/categoryEntityTestFactory/categoryEntityTestFactory';
import { CustomerModule } from '../../../../../domain/customer/customerModule';
import { UserEntityTestFactory } from '../../../../../domain/user/tests/factories/userEntityTestFactory/userEntityTestFactory';
import { UserModule } from '../../../../../domain/user/userModule';
import { createDependencyInjectionContainer } from '../../../../../libs/dependencyInjection/container';
import { LoggerModule } from '../../../../../libs/logger/loggerModule';
import { postgresConnector } from '../../../../../libs/postgres/postgresConnector';
import { PostgresModule } from '../../../../../libs/postgres/postgresModule';
import { UnitOfWorkModule } from '../../../../../libs/unitOfWork/unitOfWorkModule';
import { AuthHelper, TestTransactionExternalRunner } from '../../../../../tests/helpers';
import { IntegrationsModule } from '../../../../integrationsModule';
import { Server } from '../../../../../../server';

const baseUrl = '/categories';

describe(`CategoryControllerImpl (${baseUrl})`, () => {
  let categoryRepositoryFactory: CategoryRepositoryFactory;
  let categoryEntityTestFactory: CategoryEntityTestFactory;
  let userEntityTestFactory: UserEntityTestFactory;
  let server: Server;
  let authHelper: AuthHelper;
  let testTransactionRunner: TestTransactionExternalRunner;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    categoryEntityTestFactory = new CategoryEntityTestFactory();
    userEntityTestFactory = new UserEntityTestFactory();
  });

  beforeEach(async () => {
    const container = await createDependencyInjectionContainer([
      PostgresModule,
      CategoryModule,
      BookModule,
      AuthorModule,
      UserModule,
      IntegrationsModule,
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
        const { id: userId, role } = userEntityTestFactory.create();

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
        const { name } = categoryEntityTestFactory.create();

        const response = await request(server.instance).post(baseUrl).send({
          name,
        });

        expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      });
    });

    it('accepts a request and returns created when all required body properties are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { name } = categoryEntityTestFactory.create();

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
        const { id: userId, role } = userEntityTestFactory.create();

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
        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { id } = categoryEntityTestFactory.create();

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

        const { name } = categoryEntityTestFactory.create();

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

        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { name } = categoryEntityTestFactory.create();

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

        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { name } = categoryEntityTestFactory.create();

        await categoryRepository.createOne({ name });

        const { name: otherName } = categoryEntityTestFactory.create();

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
        const { id: userId, role } = userEntityTestFactory.create();

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
        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { id } = categoryEntityTestFactory.create();

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

        const { name } = categoryEntityTestFactory.create();

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

        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { name } = categoryEntityTestFactory.create();

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
