import 'reflect-metadata';

import request from 'supertest';
import { DataSource } from 'typeorm';

import { HttpServer } from '../../../../server/httpServer';
import { HttpServerConfigTestFactory } from '../../../../server/tests/factories/httpServerConfigTestFactory/httpServerConfigTestFactory';
import { App } from '../../../app';
import { HttpStatusCode } from '../../../../common/http/contracts/httpStatusCode';
import { AddressModule } from '../../../domain/address/addressModule';
import { AddressEntity } from '../../../domain/address/contracts/addressEntity';
import { AuthorModule } from '../../../domain/author/authorModule';
import { AuthorEntity } from '../../../domain/author/contracts/authorEntity';
import { AuthorBookModule } from '../../../domain/authorBook/authorBookModule';
import { AuthorBookEntity } from '../../../domain/authorBook/contracts/authorBookEntity';
import { BookModule } from '../../../domain/book/bookModule';
import { bookSymbols } from '../../../domain/book/bookSymbols';
import { BookEntity } from '../../../domain/book/contracts/bookEntity';
import { BookRepositoryFactory } from '../../../domain/book/contracts/factories/bookRepositoryFactory/bookRepositoryFactory';
import { BookEntityTestFactory } from '../../../domain/book/tests/factories/bookEntityTestFactory/bookEntityTestFactory';
import { BookCategoryModule } from '../../../domain/bookCategory/bookCategoryModule';
import { BookCategoryEntity } from '../../../domain/bookCategory/contracts/bookCategoryEntity';
import { CartModule } from '../../../domain/cart/cartModule';
import { CartEntity } from '../../../domain/cart/contracts/cartEntity';
import { CategoryModule } from '../../../domain/category/categoryModule';
import { CategoryEntity } from '../../../domain/category/contracts/categoryEntity';
import { CustomerEntity } from '../../../domain/customer/contracts/customerEntity';
import { CustomerModule } from '../../../domain/customer/customerModule';
import { InventoryRepositoryFactory } from '../../../domain/inventory/contracts/factories/inventoryRepositoryFactory/inventoryRepositoryFactory';
import { InventoryEntity } from '../../../domain/inventory/contracts/inventoryEntity';
import { InventoryModule } from '../../../domain/inventory/inventoryModule';
import { inventorySymbols } from '../../../domain/inventory/inventorySymbols';
import { InventoryEntityTestFactory } from '../../../domain/inventory/tests/factories/inventoryEntityTestFactory/inventoryEntityTestFactory';
import { LineItemEntity } from '../../../domain/lineItem/contracts/lineItemEntity';
import { LineItemModule } from '../../../domain/lineItem/lineItemModule';
import { OrderEntity } from '../../../domain/order/contracts/orderEntity';
import { OrderModule } from '../../../domain/order/orderModule';
import { ReviewEntity } from '../../../domain/review/contracts/reviewEntity';
import { ReviewModule } from '../../../domain/review/reviewModule';
import { TokenService } from '../../../domain/user/contracts/services/tokenService/tokenService';
import { UserEntity } from '../../../domain/user/contracts/userEntity';
import { UserEntityTestFactory } from '../../../domain/user/tests/factories/userEntityTestFactory/userEntityTestFactory';
import { UserModuleConfigTestFactory } from '../../../domain/user/tests/factories/userModuleConfigTestFactory/userModuleConfigTestFactory';
import { UserModule } from '../../../domain/user/userModule';
import { userSymbols } from '../../../domain/user/userSymbols';
import { WhishlistEntryEntity } from '../../../domain/whishlist/contracts/whishlistEntryEntity';
import { WhishlistModule } from '../../../domain/whishlist/whishlistModule';
import { DependencyInjectionContainerFactory } from '../../../../libs/dependencyInjection/implementations/factories/dependencyInjectionContainerFactory/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../../../libs/postgres/postgresModule';
import { postgresSymbols } from '../../../../libs/postgres/postgresSymbols';
import { PostgresModuleConfigTestFactory } from '../../../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';
import { UnitOfWorkModule } from '../../../../libs/unitOfWork/unitOfWorkModule';
import { TestTransactionExternalRunner } from '../../common/tests/unitOfWork/testTransactionExternalRunner';
import { IntegrationsModule } from '../../integrationsModule';

const baseUrl = '/inventories';

describe(`InventoryController (${baseUrl})`, () => {
  let bookRepositoryFactory: BookRepositoryFactory;
  let inventoryRepositoryFactory: InventoryRepositoryFactory;
  let server: HttpServer;
  let tokenService: TokenService;
  let testTransactionRunner: TestTransactionExternalRunner;
  let dataSource: DataSource;

  const bookEntityTestFactory = new BookEntityTestFactory();
  const userEntityTestFactory = new UserEntityTestFactory();
  const inventoryEntityTestFactory = new InventoryEntityTestFactory();

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

    bookRepositoryFactory = container.get<BookRepositoryFactory>(bookSymbols.bookRepositoryFactory);
    inventoryRepositoryFactory = container.get<InventoryRepositoryFactory>(inventorySymbols.inventoryRepositoryFactory);
    dataSource = container.get<DataSource>(postgresSymbols.dataSource);
    tokenService = container.get<TokenService>(userSymbols.tokenService);

    testTransactionRunner = new TestTransactionExternalRunner(container);

    const app = new App({ ...postgresModuleConfig, ...userModuleConfig, ...loggerModuleConfig });

    await app.initialize();

    server = new HttpServer(app.instance, httpServerConfig);

    await server.listen();
  });

  afterEach(async () => {
    DependencyInjectionContainerFactory.create = createContainerFunction;

    await dataSource.destroy();

    await server.close();
  });

  describe('Create inventory', () => {
    it('returns bad request when not all required properties in body are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const { bookId } = inventoryEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId, role });

        const response = await request(server.instance)
          .post(baseUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ bookId });

        expect(response.statusCode).toBe(HttpStatusCode.badRequest);
      });
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { bookId, quantity } = inventoryEntityTestFactory.create();

        const response = await request(server.instance).post(baseUrl).send({ bookId, quantity });

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('accepts a request and returns created when all required body properties are provided and book with given id exists', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { id, title, isbn, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const { id: userId, role } = userEntityTestFactory.create();

        const { quantity } = inventoryEntityTestFactory.create();

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
          .post(baseUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            bookId: book.id,
            quantity,
          });

        expect(response.statusCode).toBe(HttpStatusCode.created);
      });
    });
  });

  describe('Find inventory', () => {
    it('returns not found when book with given inventoryId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const { id } = inventoryEntityTestFactory.create();

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

        const inventoryRepository = inventoryRepositoryFactory.create(entityManager);

        const { id, title, isbn, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const { id: inventoryId, quantity } = inventoryEntityTestFactory.create();

        const book = await bookRepository.createOne({
          id,
          title,
          isbn,
          releaseYear,
          language,
          format,
          price,
        });

        const inventory = await inventoryRepository.createOne({ id: inventoryId, bookId: book.id, quantity });

        const response = await request(server.instance).get(`${baseUrl}/${inventory.id}`);

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('accepts a request and returns ok when inventoryId is uuid and have corresponding inventory', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const inventoryRepository = inventoryRepositoryFactory.create(entityManager);

        const { id: userId, role } = userEntityTestFactory.create();

        const { id, title, isbn, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const { id: inventoryId, quantity } = inventoryEntityTestFactory.create();

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

        const inventory = await inventoryRepository.createOne({ id: inventoryId, bookId: book.id, quantity });

        const response = await request(server.instance)
          .get(`${baseUrl}/${inventory.id}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.ok);
      });
    });
  });

  describe('Find inventories', () => {
    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const response = await request(server.instance).get(`${baseUrl}`);

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('accepts request', async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const inventoryRepository = inventoryRepositoryFactory.create(entityManager);

        const { id: userId, role } = userEntityTestFactory.create();

        const { id, title, isbn, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const { id: inventoryId, quantity } = inventoryEntityTestFactory.create();

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

        await inventoryRepository.createOne({ id: inventoryId, bookId: book.id, quantity });

        const response = await request(server.instance).get(`${baseUrl}`).set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.ok);
        expect(response.body.data.inventories.length).toBe(1);
      });
    });
  });

  describe('Update inventory', () => {
    it('returns not found when inventory with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const { id, quantity } = inventoryEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId, role });

        const response = await request(server.instance)
          .patch(`${baseUrl}/${id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            quantity,
          });

        expect(response.statusCode).toBe(HttpStatusCode.notFound);
      });
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const inventoryRepository = inventoryRepositoryFactory.create(entityManager);

        const { id, title, isbn, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const { id: inventoryId, quantity } = inventoryEntityTestFactory.create();

        const book = await bookRepository.createOne({
          id,
          title,
          isbn,
          releaseYear,
          language,
          format,
          price,
        });

        const inventory = await inventoryRepository.createOne({ id: inventoryId, bookId: book.id, quantity });

        const response = await request(server.instance)
          .patch(`${baseUrl}/${inventory.id}`)
          .send({
            quantity: quantity + 1,
          });

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('accepts a request and returns ok when inventoryId corresponds to existing inventory', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const inventoryRepository = inventoryRepositoryFactory.create(entityManager);

        const { id: userId, role } = userEntityTestFactory.create();

        const { id, title, isbn, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const { id: inventoryId, quantity } = inventoryEntityTestFactory.create();

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

        const inventory = await inventoryRepository.createOne({ id: inventoryId, bookId: book.id, quantity });

        const response = await request(server.instance)
          .patch(`${baseUrl}/${inventory.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            quantity: quantity + 1,
          });

        expect(response.statusCode).toBe(HttpStatusCode.ok);
      });
    });
  });

  describe('Delete inventory', () => {
    it('returns not found when inventory with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const { id } = inventoryEntityTestFactory.create();

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

        const inventoryRepository = inventoryRepositoryFactory.create(entityManager);

        const { id, title, isbn, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const { id: inventoryId, quantity } = inventoryEntityTestFactory.create();

        const book = await bookRepository.createOne({
          id,
          title,
          isbn,
          releaseYear,
          language,
          format,
          price,
        });

        const inventory = await inventoryRepository.createOne({ id: inventoryId, bookId: book.id, quantity });

        const response = await request(server.instance).delete(`${baseUrl}/${inventory.id}`).send();

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('accepts a request and returns no content when inventoryId corresponds to existing inventory', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const inventoryRepository = inventoryRepositoryFactory.create(entityManager);

        const { id: userId, role } = userEntityTestFactory.create();

        const { id, title, isbn, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const { id: inventoryId, quantity } = inventoryEntityTestFactory.create();

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

        const inventory = await inventoryRepository.createOne({ id: inventoryId, bookId: book.id, quantity });

        const response = await request(server.instance)
          .delete(`${baseUrl}/${inventory.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send();

        expect(response.statusCode).toBe(HttpStatusCode.noContent);
      });
    });
  });
});
