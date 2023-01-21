import { ConfigLoader } from '../../../../../../configLoader';
import { BookEntityTestFactory } from '../../../../../domain/book/tests/bookEntityTestDataGenerator/bookEntityTestFactoryts';
import request from 'supertest';
import { App } from '../../../../../../app';
import { BookModule } from '../../../../../domain/book/bookModule';
import { IntegrationsModule } from '../../../../integrationsModule';
import { AuthorModule } from '../../../../../domain/author/authorModule';
import { Server } from '../../../../../../server';
import { StatusCodes } from 'http-status-codes';
import { UserEntityTestDataGenerator } from '../../../../../domain/user/tests/userEntityTestDataGenerator/userEntityTestDataGenerator';
import { UserModule } from '../../../../../domain/user/userModule';
import { CategoryModule } from '../../../../../domain/category/categoryModule';
import { AuthorBookModule } from '../../../../../domain/authorBook/authorBookModule';
import { BookCategoryModule } from '../../../../../domain/bookCategory/bookCategoryModule';
import { AddressModule } from '../../../../../domain/address/addressModule';
import { CustomerModule } from '../../../../../domain/customer/customerModule';
import { BookRepositoryFactory } from '../../../../../domain/book/contracts/factories/bookRepositoryFactory/bookRepositoryFactory';
import { createDependencyInjectionContainer } from '../../../../../libs/dependencyInjection/container';
import { LoggerModule } from '../../../../../libs/logger/loggerModule';
import { postgresConnector } from '../../../../../libs/postgres/postgresConnector';
import { PostgresModule } from '../../../../../libs/postgres/postgresModule';
import { UnitOfWorkModule } from '../../../../../libs/unitOfWork/unitOfWorkModule';
import { AuthHelper, TestTransactionExternalRunner } from '../../../../../tests/helpers';

const baseUrl = '/books';

describe(`BookControllerImpl (${baseUrl})`, () => {
  let bookRepositoryFactory: BookRepositoryFactory;
  let bookEntityTestFactory: BookEntityTestFactory;
  let userEntityTestFactory: UserEntityTestDataGenerator;
  let server: Server;
  let authHelper: AuthHelper;
  let testTransactionRunner: TestTransactionExternalRunner;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    bookEntityTestFactory = new BookEntityTestFactory();
    userEntityTestFactory = new UserEntityTestDataGenerator();
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

    bookRepositoryFactory = container.resolve(BOOK_REPOSITORY_FACTORY);

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

  describe('Create book', () => {
    it('returns bad request when not all required properties in body are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.generateData();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { title } = bookEntityTestFactory.create();

        const response = await request(server.instance)
          .post(baseUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            title,
          });

        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
      });
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { title, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const response = await request(server.instance).post(baseUrl).send({
          title,
          releaseYear,
          language,
          format,
          price,
        });

        expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      });
    });

    it('accepts a request and returns created when all required body properties are provided and author with given id exists', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.generateData();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { title, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const response = await request(server.instance)
          .post(baseUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            title,
            releaseYear,
            language,
            format,
            price,
          });

        expect(response.statusCode).toBe(StatusCodes.CREATED);
      });
    });
  });

  describe('Find book', () => {
    it('returns bad request the bookId param is not uuid', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.generateData();

        const accessToken = authHelper.mockAuth({ userId, role });

        const bookId = 'abc';

        const response = await request(server.instance)
          .get(`${baseUrl}/${bookId}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
      });
    });

    it('returns not found when book with given bookId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.generateData();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { id } = bookEntityTestFactory.create();

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

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { title, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const book = await bookRepository.createOne({
          title,
          releaseYear,
          language,
          format,
          price,
        });

        const response = await request(server.instance).get(`${baseUrl}/${book.id}`);

        expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      });
    });

    it('accepts a request and returns ok when bookId is uuid and have corresponding book', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { id: userId, role } = userEntityTestFactory.generateData();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { title, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const book = await bookRepository.createOne({
          title,
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
  });

  describe('Find books', () => {
    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const response = await request(server.instance).get(`${baseUrl}`);

        expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      });
    });

    it('accepts request and returns books with filters', async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { id: userId, role } = userEntityTestFactory.generateData();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { title, releaseYear, language, format, price } = bookEntityTestFactory.create();

        await bookRepository.createOne({
          title,
          releaseYear,
          language,
          format,
          price,
        });

        const { title: otherTitle } = bookEntityTestFactory.create();

        await bookRepository.createOne({
          title: otherTitle,
          releaseYear,
          language,
          format,
          price,
        });

        const response = await request(server.instance)
          .get(`${baseUrl}?filter=["title||eq||${title}"]`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(StatusCodes.OK);
        expect(response.body.data.books.length).toBe(1);
      });
    });
  });

  describe('Update book', () => {
    it('returns bad request when provided not allowed properties in body', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.generateData();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { id, title } = bookEntityTestFactory.create();

        const response = await request(server.instance)
          .patch(`${baseUrl}/${id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            title,
          });

        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
      });
    });

    it('returns bad request when the bookId param is not uuid', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.generateData();

        const accessToken = authHelper.mockAuth({ userId, role });

        const bookId = 'abc';

        const { price } = bookEntityTestFactory.create();

        const response = await request(server.instance)
          .patch(`${baseUrl}/${bookId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            price,
          });

        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
      });
    });

    it('returns not found when book with given bookId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.generateData();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { id, price } = bookEntityTestFactory.create();

        const response = await request(server.instance)
          .patch(`${baseUrl}/${id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            price,
          });

        expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
      });
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { title, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const { price: newPrice } = bookEntityTestFactory.create();

        const book = await bookRepository.createOne({
          title,
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
    });

    it('accepts a request and returns ok when bookId is uuid and corresponds to existing book', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { id: userId, role } = userEntityTestFactory.generateData();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { title, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const { price: newPrice } = bookEntityTestFactory.create();

        const book = await bookRepository.createOne({
          title,
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
  });

  describe('Remove book', () => {
    it('returns bad request when the bookId param is not uuid', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.generateData();

        const accessToken = authHelper.mockAuth({ userId, role });

        const bookId = 'abc';

        const response = await request(server.instance)
          .delete(`${baseUrl}/${bookId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send();

        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
      });
    });

    it('returns not found when book with given bookId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.generateData();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { id } = bookEntityTestFactory.create();

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

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { title, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const book = await bookRepository.createOne({
          title,
          releaseYear,
          language,
          format,
          price,
        });

        const response = await request(server.instance).delete(`${baseUrl}/${book.id}`).send();

        expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      });
    });

    it('accepts a request and returns no content when bookId is uuid and corresponds to existing book', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { id: userId, role } = userEntityTestFactory.generateData();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { title, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const book = await bookRepository.createOne({
          title,
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
});
