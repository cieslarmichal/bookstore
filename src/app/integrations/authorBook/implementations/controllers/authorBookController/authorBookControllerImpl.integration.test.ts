import 'reflect-metadata';

import request from 'supertest';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';

import { HttpServer } from '../../../../../../server/httpServer';
import { HttpServerConfigTestFactory } from '../../../../../../server/tests/factories/httpServerConfigTestFactory/httpServerConfigTestFactory';
import { App } from '../../../../../app';
import { HttpStatusCode } from '../../../../../common/http/httpStatusCode';
import { AddressModule } from '../../../../../domain/address/addressModule';
import { AuthorModule } from '../../../../../domain/author/authorModule';
import { authorSymbols } from '../../../../../domain/author/authorSymbols';
import { AuthorRepositoryFactory } from '../../../../../domain/author/contracts/factories/authorRepositoryFactory/authorRepositoryFactory';
import { AuthorEntityTestFactory } from '../../../../../domain/author/tests/factories/authorEntityTestFactory/authorEntityTestFactory';
import { AuthorBookModule } from '../../../../../domain/authorBook/authorBookModule';
import { authorBookSymbols } from '../../../../../domain/authorBook/authorBookSymbols';
import { AuthorBookRepositoryFactory } from '../../../../../domain/authorBook/contracts/factories/authorBookRepositoryFactory/authorBookRepositoryFactory';
import { AuthorBookEntityTestFactory } from '../../../../../domain/authorBook/tests/factories/authorBookEntityTestFactory/authorBookEntityTestFactory';
import { BookModule } from '../../../../../domain/book/bookModule';
import { bookSymbols } from '../../../../../domain/book/bookSymbols';
import { BookRepositoryFactory } from '../../../../../domain/book/contracts/factories/bookRepositoryFactory/bookRepositoryFactory';
import { BookEntityTestFactory } from '../../../../../domain/book/tests/factories/bookEntityTestFactory/bookEntityTestFactory';
import { BookCategoryModule } from '../../../../../domain/bookCategory/bookCategoryModule';
import { CategoryModule } from '../../../../../domain/category/categoryModule';
import { CustomerModule } from '../../../../../domain/customer/customerModule';
import { UserEntityTestFactory } from '../../../../../domain/user/tests/factories/userEntityTestFactory/userEntityTestFactory';
import { UserModuleConfigTestFactory } from '../../../../../domain/user/tests/factories/userModuleConfigTestFactory/userModuleConfigTestFactory';
import { UserModule } from '../../../../../domain/user/userModule';
import { createDependencyInjectionContainer } from '../../../../../libs/dependencyInjection/container';
import { LoggerModule } from '../../../../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../../../../libs/logger/loggerModuleConfigTestFactory';
import { PostgresConnector } from '../../../../../libs/postgres/postgresConnector';
import { PostgresModule } from '../../../../../libs/postgres/postgresModule';
import { PostgresModuleConfigTestFactory } from '../../../../../libs/postgres/postgresModuleConfigTestFactory';
import { postgresSymbols } from '../../../../../libs/postgres/postgresSymbols';
import { UnitOfWorkModule } from '../../../../../libs/unitOfWork/unitOfWorkModule';
import { AuthHelper } from '../../../../../tests/auth/authHelper';
import { SpyFactory } from '../../../../../tests/factories/spyFactory';
import { TestTransactionExternalRunner } from '../../../../../tests/unitOfWork/testTransactionExternalRunner';
import { IntegrationsModule } from '../../../../integrationsModule';

const authorsUrl = '/authors';
const booksUrl = '/books';

describe(`AuthorBookControllerImpl ${authorsUrl}, ${booksUrl}`, () => {
  const spyFactory = new SpyFactory(vi);

  let authorBookRepositoryFactory: AuthorBookRepositoryFactory;
  let authorRepositoryFactory: AuthorRepositoryFactory;
  let bookRepositoryFactory: BookRepositoryFactory;
  let server: HttpServer;
  let authHelper: AuthHelper;
  let testTransactionRunner: TestTransactionExternalRunner;
  let postgresConnector: PostgresConnector;

  const authorBookEntityTestFactory = new AuthorBookEntityTestFactory();
  const authorEntityTestFactory = new AuthorEntityTestFactory();
  const bookEntityTestFactory = new BookEntityTestFactory();
  const userEntityTestFactory = new UserEntityTestFactory();

  const loggerModuleConfig = new LoggerModuleConfigTestFactory().create();
  const postgresModuleConfig = new PostgresModuleConfigTestFactory().create();
  const userModuleConfig = new UserModuleConfigTestFactory().create();
  const httpServerConfig = new HttpServerConfigTestFactory().create();

  beforeEach(async () => {
    const container = await createDependencyInjectionContainer([
      new PostgresModule(postgresModuleConfig),
      new CategoryModule(),
      new BookModule(),
      new AuthorModule(),
      new AuthorBookModule(),
      new UserModule(userModuleConfig),
      new IntegrationsModule(),
      new LoggerModule(loggerModuleConfig),
      new BookCategoryModule(),
      new AddressModule(),
      new CustomerModule(),
      new UnitOfWorkModule(),
    ]);

    authorRepositoryFactory = container.resolve(authorSymbols.authorRepositoryFactory);
    bookRepositoryFactory = container.resolve(bookSymbols.bookRepositoryFactory);
    authorBookRepositoryFactory = container.resolve(authorBookSymbols.authorBookRepositoryFactory);
    postgresConnector = container.resolve(postgresSymbols.postgresConnector);

    testTransactionRunner = new TestTransactionExternalRunner(container);

    authHelper = new AuthHelper(spyFactory, container);

    const app = new App({ ...postgresModuleConfig, ...userModuleConfig, ...loggerModuleConfig });

    server = new HttpServer(app.instance, httpServerConfig);

    server.listen();
  });

  afterEach(async () => {
    server.close();

    postgresConnector.closeConnection();
  });

  describe('Create authorBook', () => {
    it('returns bad request when authorId or bookId are not uuid', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const authorId = '123';
        const bookId = '123';

        const response = await request(server.instance)
          .post(`${authorsUrl}/${authorId}/books/${bookId}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.badRequest);
      });
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async () => {
        const { authorId, bookId } = authorBookEntityTestFactory.create();

        const response = await request(server.instance).post(`${authorsUrl}/${authorId}/books/${bookId}`);

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('returns unprocessable entity when authorBook with authorId and bookId already exists', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const authorBookRepository = authorBookRepositoryFactory.create(entityManager);

        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { title, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const book = await bookRepository.createOne({
          title,
          releaseYear,
          language,
          format,
          price,
        });

        const { firstName, lastName } = authorEntityTestFactory.create();

        const author = await authorRepository.createOne({ firstName, lastName });

        await authorBookRepository.createOne({ authorId: author.id, bookId: book.id });

        const response = await request(server.instance)
          .post(`${authorsUrl}/${author.id}/books/${book.id}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.unprocessableEntity);
      });
    });

    it('returns not found when author or book corresponding to authorId and bookId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { authorId, bookId } = authorBookEntityTestFactory.create();

        const response = await request(server.instance)
          .post(`${authorsUrl}/${authorId}/books/${bookId}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.notFound);
      });
    });

    it('returns created when all required params are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { title, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const book = await bookRepository.createOne({
          title,
          releaseYear,
          language,
          format,
          price,
        });

        const { firstName, lastName } = authorEntityTestFactory.create();

        const author = await authorRepository.createOne({ firstName, lastName });

        const response = await request(server.instance)
          .post(`${authorsUrl}/${author.id}/books/${book.id}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.created);
      });
    });
  });

  describe('Find author books', () => {
    it('returns bad request the authorId param is not uuid', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const authorId = 'abc';

        const response = await request(server.instance)
          .get(`${authorsUrl}/${authorId}/books`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.badRequest);
      });
    });

    it('returns not found when author with given authorId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { id } = authorEntityTestFactory.create();

        const response = await request(server.instance)
          .get(`${authorsUrl}/${id}/books`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.notFound);
      });
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const { firstName, lastName } = authorEntityTestFactory.create();

        const author = await authorRepository.createOne({ firstName, lastName });

        const response = await request(server.instance).get(`${authorsUrl}/${author.id}/books`);

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('returns ok when authorId is uuid and have corresponding author', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { firstName, lastName } = authorEntityTestFactory.create();

        const author = await authorRepository.createOne({ firstName, lastName });

        const response = await request(server.instance)
          .get(`${authorsUrl}/${author.id}/books`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.ok);
      });
    });

    it('returns books matching filter criteria', async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const authorBookRepository = authorBookRepositoryFactory.create(entityManager);

        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { title, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const book1 = await bookRepository.createOne({
          title,
          releaseYear,
          language,
          format,
          price,
        });

        const { title: otherTitle } = bookEntityTestFactory.create();

        const book2 = await bookRepository.createOne({
          title: otherTitle,
          releaseYear,
          language,
          format,
          price,
        });

        const { firstName, lastName } = authorEntityTestFactory.create();

        const author = await authorRepository.createOne({ firstName, lastName });

        await authorBookRepository.createOne({ authorId: author.id, bookId: book1.id });
        await authorBookRepository.createOne({ authorId: author.id, bookId: book2.id });

        const response = await request(server.instance)
          .get(`${authorsUrl}/${author.id}/books?filter=["title||like||${title}"]`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.ok);
        expect(response.body.data.books.length).toBe(1);
      });
    });
  });

  describe('Find authors of the book', () => {
    it('returns bad request the bookId param is not uuid', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const bookId = 'abc';

        const response = await request(server.instance)
          .get(`${booksUrl}/${bookId}/authors`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.badRequest);
      });
    });

    it('returns not found when book with given bookId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { id } = bookEntityTestFactory.create();

        const response = await request(server.instance)
          .get(`${booksUrl}/${id}/authors`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.notFound);
      });
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
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

        const response = await request(server.instance).get(`${booksUrl}/${book.id}/authors`);

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('returns ok when bookId is uuid and have corresponding book', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { id: userId, role } = userEntityTestFactory.create();

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
          .get(`${booksUrl}/${book.id}/authors`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.ok);
      });
    });

    it('returns authors matching filter criteria', async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const authorBookRepository = authorBookRepositoryFactory.create(entityManager);

        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { title, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const book = await bookRepository.createOne({
          title,
          releaseYear,
          language,
          format,
          price,
        });

        const { firstName, lastName } = authorEntityTestFactory.create();

        const author1 = await authorRepository.createOne({ firstName, lastName });

        const { firstName: otherFirstName } = authorEntityTestFactory.create();

        const author2 = await authorRepository.createOne({ firstName: otherFirstName, lastName });

        await authorBookRepository.createOne({ authorId: author1.id, bookId: book.id });
        await authorBookRepository.createOne({ authorId: author2.id, bookId: book.id });

        const response = await request(server.instance)
          .get(`${booksUrl}/${book.id}/authors?filter=["firstName||like||${firstName}"]`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.ok);
        expect(response.body.data.authors.length).toBe(1);
      });
    });
  });

  describe('Delete authorBook', () => {
    it('returns bad request when authorId or bookId params are not uuid', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const authorId = 'abc';
        const bookId = 'dfg';

        const response = await request(server.instance)
          .delete(`${authorsUrl}/${authorId}/books/${bookId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send();

        expect(response.statusCode).toBe(HttpStatusCode.badRequest);
      });
    });

    it('returns not found when authorBook with authorId and bookId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { authorId, bookId } = authorBookEntityTestFactory.create();

        const response = await request(server.instance)
          .delete(`${authorsUrl}/${authorId}/books/${bookId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send();

        expect(response.statusCode).toBe(HttpStatusCode.notFound);
      });
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const authorBookRepository = authorBookRepositoryFactory.create(entityManager);

        const { title, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const book = await bookRepository.createOne({
          title,
          releaseYear,
          language,
          format,
          price,
        });

        const { firstName, lastName } = authorEntityTestFactory.create();

        const author = await authorRepository.createOne({ firstName, lastName });

        await authorBookRepository.createOne({ authorId: author.id, bookId: book.id });

        const response = await request(server.instance).delete(`${authorsUrl}/${author.id}/books/${book.id}`).send();

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('accepts a request and returns no content when authorBookId is uuid and corresponds to existing authorBook', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const authorBookRepository = authorBookRepositoryFactory.create(entityManager);

        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { title, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const book = await bookRepository.createOne({
          title,
          releaseYear,
          language,
          format,
          price,
        });

        const { firstName, lastName } = authorEntityTestFactory.create();

        const author = await authorRepository.createOne({ firstName, lastName });

        await authorBookRepository.createOne({ authorId: author.id, bookId: book.id });

        const response = await request(server.instance)
          .delete(`${authorsUrl}/${author.id}/books/${book.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send();

        expect(response.statusCode).toBe(HttpStatusCode.noContent);
      });
    });
  });
});
