import 'reflect-metadata';

import request from 'supertest';
import { DataSource } from 'typeorm';

import { HttpStatusCode } from '../../../../common/http/httpStatusCode';
import { TestTransactionExternalRunner } from '../../../../common/tests/testTransactionExternalRunner';
import { DependencyInjectionContainerFactory } from '../../../../libs/dependencyInjection/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../../../libs/postgres/postgresModule';
import { postgresModuleSymbols } from '../../../../libs/postgres/postgresModuleSymbols';
import { PostgresModuleConfigTestFactory } from '../../../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';
import { UnitOfWorkModule } from '../../../../libs/unitOfWork/unitOfWorkModule';
import { HttpServer } from '../../../../server/httpServer';
import { HttpServerConfigTestFactory } from '../../../../server/tests/factories/httpServerConfigTestFactory/httpServerConfigTestFactory';
import { AddressModule } from '../../../addressModule/addressModule';
import { AddressEntity } from '../../../addressModule/infrastructure/repositories/addressRepository/addressEntity/addressEntity';
import { Application } from '../../../application';
import { AuthorBookModule } from '../../../authorBookModule/authorBookModule';
import { AuthorBookEntity } from '../../../authorBookModule/infrastructure/repositories/authorBookRepository/authorBookEntity/authorBookEntity';
import { AuthorModule } from '../../../authorModule/authorModule';
import { AuthorEntity } from '../../../authorModule/infrastructure/repositories/authorRepository/authorEntity/authorEntity';
import { BookCategoryModule } from '../../../bookCategoryModule/bookCategoryModule';
import { BookCategoryEntity } from '../../../bookCategoryModule/infrastructure/repositories/bookCategoryRepository/bookCategoryEntity/bookCategoryEntity';
import { CartModule } from '../../../cartModule/cartModule';
import { CartEntity } from '../../../cartModule/infrastructure/repositories/cartRepository/cartEntity/cartEntity';
import { CategoryModule } from '../../../categoryModule/categoryModule';
import { CategoryEntity } from '../../../categoryModule/infrastructure/repositories/categoryRepository/categoryEntity/categoryEntity';
import { CustomerModule } from '../../../customerModule/customerModule';
import { CustomerEntity } from '../../../customerModule/infrastructure/repositories/customerRepository/customerEntity/customerEntity';
import { IntegrationsModule } from '../../../integrations/integrationsModule';
import { InventoryEntity } from '../../../inventoryModule/infrastructure/repositories/inventoryRepository/inventoryEntity/inventoryEntity';
import { InventoryModule } from '../../../inventoryModule/inventoryModule';
import { LineItemEntity } from '../../../lineItemModule/infrastructure/repositories/lineItemRepository/lineItemEntity/lineItemEntity';
import { LineItemModule } from '../../../lineItemModule/lineItemModule';
import { OrderEntity } from '../../../orderModule/infrastructure/repositories/orderRepository/orderEntity/orderEntity';
import { OrderModule } from '../../../orderModule/orderModule';
import { ReviewEntity } from '../../../reviewModule/infrastructure/repositories/reviewRepository/reviewEntity/reviewEntity';
import { ReviewModule } from '../../../reviewModule/reviewModule';
import { TokenService } from '../../../userModule/application/services/tokenService/tokenService';
import { UserEntity } from '../../../userModule/infrastructure/repositories/userRepository/userEntity/userEntity';
import { UserEntityTestFactory } from '../../../userModule/tests/factories/userEntityTestFactory/userEntityTestFactory';
import { UserModuleConfigTestFactory } from '../../../userModule/tests/factories/userModuleConfigTestFactory/userModuleConfigTestFactory';
import { UserModule } from '../../../userModule/userModule';
import { userModuleSymbols } from '../../../userModule/userModuleSymbols';
import { WhishlistEntryEntity } from '../../../whishlistModule/infrastructure/repositories/whishlistEntryRepository/whishlistEntryEntity/whishlistEntryEntity';
import { WhishlistModule } from '../../../whishlistModule/whishlistModule';
import { BookRepositoryFactory } from '../../application/repositories/bookRepository/bookRepositoryFactory';
import { BookModule } from '../../bookModule';
import { bookModuleSymbols } from '../../bookModuleSymbols';
import { BookEntityTestFactory } from '../../tests/factories/bookEntityTestFactory/bookEntityTestFactory';
import { BookEntity } from '../repositories/bookRepository/bookEntity/bookEntity';

const baseUrl = '/books';

describe(`BookController (${baseUrl})`, () => {
  let bookRepositoryFactory: BookRepositoryFactory;
  let server: HttpServer;
  let tokenService: TokenService;
  let testTransactionRunner: TestTransactionExternalRunner;
  let dataSource: DataSource;

  const bookEntityTestFactory = new BookEntityTestFactory();
  const userEntityTestFactory = new UserEntityTestFactory();

  const loggerModuleConfig = new LoggerModuleConfigTestFactory().create();
  const postgresModuleConfig = new PostgresModuleConfigTestFactory().create({
    entities: [
      BookEntity,
      AuthorEntity,
      UserEntity,
      CategoryEntity,
      AuthorBookEntity,
      BookCategoryEntity,
      AddressEntity,
      CustomerEntity,
      CartEntity,
      LineItemEntity,
      OrderEntity,
      InventoryEntity,
      ReviewEntity,
      WhishlistEntryEntity,
    ],
  });
  const userModuleConfig = new UserModuleConfigTestFactory().create();
  const httpServerConfig = new HttpServerConfigTestFactory().create();

  const createContainerFunction = DependencyInjectionContainerFactory.create;

  beforeEach(async () => {
    const container = await DependencyInjectionContainerFactory.create({
      modules: [
        new PostgresModule(postgresModuleConfig),
        new CategoryModule(),
        new BookModule(),
        new AuthorModule(),
        new UserModule(userModuleConfig),
        new IntegrationsModule(),
        new AuthorBookModule(),
        new LoggerModule(loggerModuleConfig),
        new BookCategoryModule(),
        new AddressModule(),
        new CustomerModule(),
        new UnitOfWorkModule(),
        new CartModule(),
        new LineItemModule(),
        new OrderModule(),
        new InventoryModule(),
        new ReviewModule(),
        new WhishlistModule(),
      ],
    });

    DependencyInjectionContainerFactory.create = jest.fn().mockResolvedValue(container);

    bookRepositoryFactory = container.get<BookRepositoryFactory>(bookModuleSymbols.bookRepositoryFactory);
    dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);
    tokenService = container.get<TokenService>(userModuleSymbols.tokenService);

    testTransactionRunner = new TestTransactionExternalRunner(container);

    const app = new Application({ ...postgresModuleConfig, ...userModuleConfig, ...loggerModuleConfig });

    await app.initialize();

    server = new HttpServer(app.instance, httpServerConfig);

    await server.listen();
  });

  afterEach(async () => {
    DependencyInjectionContainerFactory.create = createContainerFunction;

    await dataSource.destroy();

    await server.close();
  });

  describe('Create book', () => {
    it('returns bad request when not all required properties in body are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const { title } = bookEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId, role });

        const response = await request(server.instance)
          .post(baseUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            title,
          });

        expect(response.statusCode).toBe(HttpStatusCode.badRequest);
      });
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { title, isbn, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const response = await request(server.instance).post(baseUrl).send({
          title,
          isbn,
          releaseYear,
          language,
          format,
          price,
        });

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('accepts a request and returns created when all required body properties are provided and author with given id exists', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const { title, isbn, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId, role });

        const response = await request(server.instance)
          .post(baseUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            title,
            isbn,
            releaseYear,
            language,
            format,
            price,
          });

        expect(response.statusCode).toBe(HttpStatusCode.created);
      });
    });
  });

  describe('Find book', () => {
    it('returns not found when book with given bookId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const { id } = bookEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId, role });

        const response = await request(server.instance)
          .get(`${baseUrl}/${id}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.notFound);
      });
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { id, title, isbn, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const book = await bookRepository.createOne({
          id,
          title,
          isbn,
          releaseYear,
          language,
          format,
          price,
        });

        const response = await request(server.instance).get(`${baseUrl}/${book.id}`);

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('accepts a request and returns ok when bookId is uuid and have corresponding book', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { id: userId, role } = userEntityTestFactory.create();

        const { id, title, isbn, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId, role });

        const book = await bookRepository.createOne({
          id,
          title,
          isbn,
          releaseYear,
          language,
          format,
          price,
        });

        const response = await request(server.instance)
          .get(`${baseUrl}/${book.id}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.ok);
      });
    });
  });

  describe('Find books', () => {
    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const response = await request(server.instance).get(`${baseUrl}`);

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('accepts request and returns books with filters', async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { id: userId, role } = userEntityTestFactory.create();

        const bookEntity1 = bookEntityTestFactory.create();

        const bookEntity2 = bookEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId, role });

        await bookRepository.createOne({
          id: bookEntity1.id,
          format: bookEntity1.format,
          language: bookEntity1.language,
          price: bookEntity1.price,
          title: bookEntity1.title,
          isbn: bookEntity1.isbn,
          releaseYear: bookEntity1.releaseYear,
        });

        await bookRepository.createOne({
          id: bookEntity2.id,
          format: bookEntity2.format,
          language: bookEntity2.language,
          price: bookEntity2.price,
          title: bookEntity2.title,
          isbn: bookEntity2.isbn,
          releaseYear: bookEntity2.releaseYear,
        });

        const response = await request(server.instance)
          .get(`${baseUrl}?filter=["title||eq||${bookEntity1.title}"]`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.ok);
        expect(response.body.data.books.length).toBe(1);
      });
    });
  });

  describe('Update book', () => {
    it('returns not found when book with given bookId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const { id, price } = bookEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId, role });

        const response = await request(server.instance)
          .patch(`${baseUrl}/${id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            price,
          });

        expect(response.statusCode).toBe(HttpStatusCode.notFound);
      });
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { id, title, isbn, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const { price: newPrice } = bookEntityTestFactory.create();

        const book = await bookRepository.createOne({
          id,
          title,
          isbn,
          releaseYear,
          language,
          format,
          price,
        });

        const response = await request(server.instance).patch(`${baseUrl}/${book.id}`).send({
          price: newPrice,
        });

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('accepts a request and returns ok when bookId is uuid and corresponds to existing book', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { id: userId, role } = userEntityTestFactory.create();

        const { id, title, isbn, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const { price: newPrice } = bookEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId, role });

        const book = await bookRepository.createOne({
          id,
          title,
          isbn,
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

        expect(response.statusCode).toBe(HttpStatusCode.ok);
      });
    });
  });

  describe('Delete book', () => {
    it('returns not found when book with given bookId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const { id } = bookEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId, role });

        const response = await request(server.instance)
          .delete(`${baseUrl}/${id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send();

        expect(response.statusCode).toBe(HttpStatusCode.notFound);
      });
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { id, title, isbn, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const book = await bookRepository.createOne({
          id,
          title,
          isbn,
          releaseYear,
          language,
          format,
          price,
        });

        const response = await request(server.instance).delete(`${baseUrl}/${book.id}`).send();

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('accepts a request and returns no content when bookId is uuid and corresponds to existing book', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { id: userId, role } = userEntityTestFactory.create();

        const { id, title, isbn, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId, role });

        const book = await bookRepository.createOne({
          id,
          title,
          isbn,
          releaseYear,
          language,
          format,
          price,
        });

        const response = await request(server.instance)
          .delete(`${baseUrl}/${book.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send();

        expect(response.statusCode).toBe(HttpStatusCode.noContent);
      });
    });
  });
});
