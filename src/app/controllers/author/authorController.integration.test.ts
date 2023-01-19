import { ConfigLoader } from '../../../configLoader';
import { AuthorTestDataGenerator } from '../../domain/author/testDataGenerators/authorTestDataGenerator';
import request from 'supertest';
import { App } from '../../../app';
import { createDIContainer, dbManager, UnitOfWorkModule } from '../../common';
import { DbModule } from '../../common';
import { AuthorModule } from '../../domain/author/authorModule';
import { ControllersModule } from '../controllersModule';
import { BookModule } from '../../domain/book/bookModule';
import { Server } from '../../../server';
import { AuthorRepositoryFactory } from '../../domain/author/repositories/authorRepositoryFactory';
import { UserTestDataGenerator } from '../../domain/user/testDataGenerators/userTestDataGenerator';
import { StatusCodes } from 'http-status-codes';
import { AuthHelper, TestTransactionExternalRunner } from '../../../integration/helpers';
import { UserModule } from '../../domain/user/userModule';
import { CategoryModule } from '../../domain/category/categoryModule';
import { AuthorBookModule } from '../../domain/authorBook/authorBookModule';
import { LoggerModule } from '../../common/logger/loggerModule';
import { AUTHOR_REPOSITORY_FACTORY } from '../../domain/author/authorSymbols';
import { BookCategoryModule } from '../../domain/bookCategory/bookCategoryModule';
import { AddressModule } from '../../domain/address/addressModule';
import { CustomerModule } from '../../domain/customer/customerModule';

const baseUrl = '/authors';

describe(`AuthorController (${baseUrl})`, () => {
  let authorRepositoryFactory: AuthorRepositoryFactory;
  let authorTestDataGenerator: AuthorTestDataGenerator;
  let userTestDataGenerator: UserTestDataGenerator;
  let server: Server;
  let authHelper: AuthHelper;
  let testTransactionRunner: TestTransactionExternalRunner;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    authorTestDataGenerator = new AuthorTestDataGenerator();
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

    dbManager.closeConnection();
  });

  describe('Create author', () => {
    it('returns bad request when not all required properties in body are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userTestDataGenerator.generateData();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { firstName } = authorTestDataGenerator.generateData();

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
        const { firstName, lastName } = authorTestDataGenerator.generateData();

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
        const { id: userId, role } = userTestDataGenerator.generateData();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { firstName, lastName } = authorTestDataGenerator.generateData();

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
        const { id: userId, role } = userTestDataGenerator.generateData();

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
        const { id: userId, role } = userTestDataGenerator.generateData();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { id } = authorTestDataGenerator.generateData();

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

        const { firstName, lastName } = authorTestDataGenerator.generateData();

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

        const { id: userId, role } = userTestDataGenerator.generateData();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { firstName, lastName } = authorTestDataGenerator.generateData();

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

        const { id: userId, role } = userTestDataGenerator.generateData();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { firstName, lastName } = authorTestDataGenerator.generateData();

        await authorRepository.createOne({ firstName, lastName });

        const { firstName: otherFirstName } = authorTestDataGenerator.generateData();

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
        const { id: userId, role } = userTestDataGenerator.generateData();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { id, firstName } = authorTestDataGenerator.generateData();

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
        const { id: userId, role } = userTestDataGenerator.generateData();

        const accessToken = authHelper.mockAuth({ userId, role });

        const authorId = 'abc';

        const { about } = authorTestDataGenerator.generateData();

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
        const { id: userId, role } = userTestDataGenerator.generateData();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { id, about } = authorTestDataGenerator.generateData();

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

        const { firstName, lastName } = authorTestDataGenerator.generateData();

        const { about } = authorTestDataGenerator.generateData();

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

        const { id: userId, role } = userTestDataGenerator.generateData();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { firstName, lastName } = authorTestDataGenerator.generateData();

        const { about } = authorTestDataGenerator.generateData();

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
        const { id: userId, role } = userTestDataGenerator.generateData();

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
        const { id: userId, role } = userTestDataGenerator.generateData();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { id } = authorTestDataGenerator.generateData();

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

        const { firstName, lastName } = authorTestDataGenerator.generateData();

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

        const { id: userId, role } = userTestDataGenerator.generateData();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { firstName, lastName } = authorTestDataGenerator.generateData();

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
