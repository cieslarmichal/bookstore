import { ConfigLoader } from '../../../../../../configLoader';
import request from 'supertest';
import { App } from '../../../../../../app';
import { AuthorModule } from '../../../../../domain/author/authorModule';
import { IntegrationsModule } from '../../../../integrationsModule';
import { BookModule } from '../../../../../domain/book/bookModule';
import { Server } from '../../../../../../server';
import { UserEntityTestFactory } from '../../../../../domain/user/tests/factories/userEntityTestFactory/userEntityTestFactory';
import { StatusCodes } from 'http-status-codes';
import { UserModule } from '../../../../../domain/user/userModule';
import { CategoryModule } from '../../../../../domain/category/categoryModule';
import { AuthorBookModule } from '../../../../../domain/authorBook/authorBookModule';
import { BookCategoryModule } from '../../../../../domain/bookCategory/bookCategoryModule';
import { AddressModule } from '../../../../../domain/address/addressModule';
import { CustomerModule } from '../../../../../domain/customer/customerModule';
import { AuthorRepositoryFactory } from '../../../../../domain/author/contracts/factories/authorRepositoryFactory/authorRepositoryFactory';
import { LoggerModule } from '../../../../../libs/logger/loggerModule';
import { postgresConnector } from '../../../../../libs/postgres/postgresConnector';
import { PostgresModule } from '../../../../../libs/postgres/postgresModule';
import { UnitOfWorkModule } from '../../../../../libs/unitOfWork/unitOfWorkModule';
import { AuthHelper, TestTransactionExternalRunner } from '../../../../../tests/helpers';

const baseUrl = '/authors';

describe(`AuthorControllerImpl (${baseUrl})`, () => {
  let authorRepositoryFactory: AuthorRepositoryFactory;
  let authorEntityTestFactory: AuthorEntityTestFactory;
  let userEntityTestFactory: UserEntityTestFactory;
  let server: Server;
  let authHelper: AuthHelper;
  let testTransactionRunner: TestTransactionExternalRunner;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    authorEntityTestFactory = new AuthorEntityTestFactory();
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

    authorRepositoryFactory = container.resolve(AUTHOR_REPOSITORY_FACTORY);

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

  describe('Create author', () => {
    it('returns bad request when not all required properties in body are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { firstName } = authorEntityTestFactory.generateData();

        const response = await request(server.instance)
          .post(baseUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            firstName,
          });

        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
      });
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { firstName, lastName } = authorEntityTestFactory.generateData();

        const response = await request(server.instance).post(baseUrl).send({
          firstName,
          lastName,
        });

        expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      });
    });

    it('accepts a request and returns created when all required body properties are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { firstName, lastName } = authorEntityTestFactory.generateData();

        const response = await request(server.instance)
          .post(baseUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            firstName,
            lastName,
          });

        expect(response.statusCode).toBe(StatusCodes.CREATED);
      });
    });
  });

  describe('Find author', () => {
    it('returns bad request the authorId param is not uuid', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const authorId = 'abc';

        const response = await request(server.instance)
          .get(`${baseUrl}/${authorId}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
      });
    });

    it('returns not found when author with given authorId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { id } = authorEntityTestFactory.generateData();

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

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const { firstName, lastName } = authorEntityTestFactory.generateData();

        const author = await authorRepository.createOne({ firstName, lastName });

        const response = await request(server.instance).get(`${baseUrl}/${author.id}`);

        expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      });
    });

    it('accepts a request and returns ok when authorId is uuid and have corresponding author', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { firstName, lastName } = authorEntityTestFactory.generateData();

        const author = await authorRepository.createOne({ firstName, lastName });

        const response = await request(server.instance)
          .get(`${baseUrl}/${author.id}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(StatusCodes.OK);
      });
    });
  });

  describe('Find authors', () => {
    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const response = await request(server.instance).get(`${baseUrl}`);

        expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      });
    });

    it('returns authors with filtering provided', async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { firstName, lastName } = authorEntityTestFactory.generateData();

        await authorRepository.createOne({ firstName, lastName });

        const { firstName: otherFirstName } = authorEntityTestFactory.generateData();

        await authorRepository.createOne({ firstName: otherFirstName, lastName });

        const response = await request(server.instance)
          .get(`${baseUrl}?filter=["firstName||eq||${firstName}"]`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(StatusCodes.OK);
        expect(response.body.data.authors.length).toBe(1);
      });
    });
  });

  describe('Update author', () => {
    it('returns bad request when provided not allowed properties in body', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { id, firstName } = authorEntityTestFactory.generateData();

        const response = await request(server.instance)
          .patch(`${baseUrl}/${id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            firstName,
          });

        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
      });
    });

    it('returns bad request when the authorId param is not uuid', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const authorId = 'abc';

        const { about } = authorEntityTestFactory.generateData();

        const response = await request(server.instance)
          .patch(`${baseUrl}/${authorId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            about,
          });

        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
      });
    });

    it('returns not found when author with given authorId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { id, about } = authorEntityTestFactory.generateData();

        const response = await request(server.instance)
          .patch(`${baseUrl}/${id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            about,
          });

        expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
      });
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const { firstName, lastName } = authorEntityTestFactory.generateData();

        const { about } = authorEntityTestFactory.generateData();

        const author = await authorRepository.createOne({ firstName, lastName });

        const response = await request(server.instance).patch(`${baseUrl}/${author.id}`).send({
          about,
        });

        expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      });
    });

    it('accepts a request and returns ok when authorId is uuid and corresponds to existing author', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { firstName, lastName } = authorEntityTestFactory.generateData();

        const { about } = authorEntityTestFactory.generateData();

        const author = await authorRepository.createOne({ firstName, lastName });

        const response = await request(server.instance)
          .patch(`${baseUrl}/${author.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            about,
          });

        expect(response.statusCode).toBe(StatusCodes.OK);
      });
    });
  });

  describe('Remove author', () => {
    it('returns bad request when the authorId param is not uuid', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const authorId = 'abc';

        const response = await request(server.instance)
          .delete(`${baseUrl}/${authorId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send();

        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
      });
    });

    it('returns not found when author with given authorId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { id } = authorEntityTestFactory.generateData();

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

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const { firstName, lastName } = authorEntityTestFactory.generateData();

        const author = await authorRepository.createOne({ firstName, lastName });

        const response = await request(server.instance).delete(`${baseUrl}/${author.id}`).send();

        expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      });
    });

    it('accepts a request and returns no content when authorId is uuid and corresponds to existing author', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { firstName, lastName } = authorEntityTestFactory.generateData();

        const author = await authorRepository.createOne({ firstName, lastName });

        const response = await request(server.instance)
          .delete(`${baseUrl}/${author.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send();

        expect(response.statusCode).toBe(StatusCodes.NO_CONTENT);
      });
    });
  });
});
