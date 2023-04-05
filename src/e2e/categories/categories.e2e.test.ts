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
import { Application } from '../../../application';
import { AddressModule } from '../../../domain/address/addressModule';
import { AddressEntity } from '../../../domain/address/contracts/addressEntity';
import { AuthorModule } from '../../../domain/author/authorModule';
import { AuthorEntity } from '../../../domain/author/contracts/authorEntity';
import { AuthorBookModule } from '../../../domain/authorBook/authorBookModule';
import { AuthorBookEntity } from '../../../domain/authorBook/contracts/authorBookEntity';
import { BookModule } from '../../../domain/book/bookModule';
import { BookEntity } from '../../../domain/book/contracts/bookEntity';
import { BookCategoryModule } from '../../../domain/bookCategory/bookCategoryModule';
import { BookCategoryEntity } from '../../../domain/bookCategory/contracts/bookCategoryEntity';
import { CartModule } from '../../../domain/cart/cartModule';
import { CartEntity } from '../../../domain/cart/contracts/cartEntity';
import { CategoryModule } from '../../../domain/category/categoryModule';
import { categoryModuleSymbols } from '../../../domain/category/categoryModuleSymbols';
import { CategoryEntity } from '../../../domain/category/contracts/categoryEntity';
import { CategoryRepositoryFactory } from '../../../domain/category/contracts/factories/categoryRepositoryFactory/categoryRepositoryFactory';
import { CategoryEntityTestFactory } from '../../../domain/category/tests/factories/categoryEntityTestFactory/categoryEntityTestFactory';
import { CustomerEntity } from '../../../domain/customer/contracts/customerEntity';
import { CustomerModule } from '../../../domain/customer/customerModule';
import { InventoryEntity } from '../../../domain/inventory/contracts/inventoryEntity';
import { InventoryModule } from '../../../domain/inventory/inventoryModule';
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
import { userModuleSymbols } from '../../../domain/user/userModuleSymbols';
import { WhishlistEntryEntity } from '../../../domain/whishlist/contracts/whishlistEntryEntity';
import { WhishlistModule } from '../../../domain/whishlist/whishlistModule';
import { IntegrationsModule } from '../../../integrations/integrationsModule';

const baseUrl = '/categories';

describe(`CategoryController (${baseUrl})`, () => {
  let categoryRepositoryFactory: CategoryRepositoryFactory;
  let server: HttpServer;
  let tokenService: TokenService;
  let testTransactionRunner: TestTransactionExternalRunner;
  let dataSource: DataSource;

  const categoryEntityTestFactory = new CategoryEntityTestFactory();
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

    categoryRepositoryFactory = container.get<CategoryRepositoryFactory>(
      categoryModuleSymbols.categoryRepositoryFactory,
    );
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

    await server.close();

    await dataSource.destroy();
  });

  describe('Create category', () => {
    it('returns bad request when not all required properties in body are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId } = userEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId });

        const response = await request(server.instance)
          .post(baseUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({});

        expect(response.statusCode).toBe(HttpStatusCode.badRequest);
      });
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { name } = categoryEntityTestFactory.create();

        const response = await request(server.instance).post(baseUrl).send({
          name,
        });

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('accepts a request and returns created when all required body properties are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId } = userEntityTestFactory.create();

        const { name } = categoryEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId });

        const response = await request(server.instance)
          .post(baseUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            name,
          });

        expect(response.statusCode).toBe(HttpStatusCode.created);
      });
    });
  });

  describe('Find category', () => {
    it('returns not found when category with given categoryId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId } = userEntityTestFactory.create();

        const { id } = categoryEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId });

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

        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const { id, name } = categoryEntityTestFactory.create();

        const category = await categoryRepository.createOne({ id, name });

        const response = await request(server.instance).get(`${baseUrl}/${category.id}`);

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('accepts a request and returns ok when categoryId is uuid and have corresponding category', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const { id: userId } = userEntityTestFactory.create();

        const { id, name } = categoryEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId });

        const category = await categoryRepository.createOne({ id, name });

        const response = await request(server.instance)
          .get(`${baseUrl}/${category.id}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.ok);
      });
    });
  });

  describe('Find categories', () => {
    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const response = await request(server.instance).get(`${baseUrl}`);

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('returns categories with filtering provided', async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const { id: userId } = userEntityTestFactory.create();

        const categoryEntity1 = categoryEntityTestFactory.create();

        const categoryEntity2 = categoryEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId });

        await categoryRepository.createOne(categoryEntity1);

        await categoryRepository.createOne(categoryEntity2);

        const response = await request(server.instance)
          .get(`${baseUrl}?filter=["name||eq||${categoryEntity1.name}"]`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.ok);
        expect(response.body.data.categories.length).toBe(1);
      });
    });
  });

  describe('Delete category', () => {
    it('returns not found when category with given categoryId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId } = userEntityTestFactory.create();

        const { id } = categoryEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId });

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

        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const { id, name } = categoryEntityTestFactory.create();

        const category = await categoryRepository.createOne({ id, name });

        const response = await request(server.instance).delete(`${baseUrl}/${category.id}`).send();

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('accepts a request and returns no content when categoryId is uuid and corresponds to existing category', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const { id: userId } = userEntityTestFactory.create();

        const { id, name } = categoryEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId });

        const category = await categoryRepository.createOne({ id, name });

        const response = await request(server.instance)
          .delete(`${baseUrl}/${category.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send();

        expect(response.statusCode).toBe(HttpStatusCode.noContent);
      });
    });
  });
});
