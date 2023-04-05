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
import { AddressModule } from '../../modules/addressModule/addressModule';
import { AddressEntity } from '../../modules/addressModule/infrastructure/repositories/addressRepository/addressEntity/addressEntity';
import { AuthorBookModule } from '../../modules/authorBookModule/authorBookModule';
import { AuthorBookEntity } from '../../modules/authorBookModule/infrastructure/repositories/authorBookRepository/authorBookEntity/authorBookEntity';
import { AuthorRepositoryFactory } from '../../modules/authorModule/application/repositories/authorRepository/authorRepositoryFactory';
import { AuthorModule } from '../../modules/authorModule/authorModule';
import { authorModuleSymbols } from '../../modules/authorModule/authorModuleSymbols';
import { AuthorEntity } from '../../modules/authorModule/infrastructure/repositories/authorRepository/authorEntity/authorEntity';
import { AuthorEntityTestFactory } from '../../modules/authorModule/tests/factories/authorEntityTestFactory/authorEntityTestFactory';
import { BookCategoryModule } from '../../modules/bookCategoryModule/bookCategoryModule';
import { BookCategoryEntity } from '../../modules/bookCategoryModule/infrastructure/repositories/bookCategoryRepository/bookCategoryEntity/bookCategoryEntity';
import { BookModule } from '../../modules/bookModule/bookModule';
import { BookEntity } from '../../modules/bookModule/infrastructure/repositories/bookRepository/bookEntity/bookEntity';
import { CategoryModule } from '../../modules/categoryModule/categoryModule';
import { CategoryEntity } from '../../modules/categoryModule/infrastructure/repositories/categoryRepository/categoryEntity/categoryEntity';
import { CustomerModule } from '../../modules/customerModule/customerModule';
import { CustomerEntity } from '../../modules/customerModule/infrastructure/repositories/customerRepository/customerEntity/customerEntity';
import { InventoryEntity } from '../../modules/inventoryModule/infrastructure/repositories/inventoryRepository/inventoryEntity/inventoryEntity';
import { InventoryModule } from '../../modules/inventoryModule/inventoryModule';
import { CartEntity } from '../../modules/orderModule/infrastructure/repositories/cartRepository/cartEntity/cartEntity';
import { LineItemEntity } from '../../modules/orderModule/infrastructure/repositories/lineItemRepository/lineItemEntity/lineItemEntity';
import { OrderEntity } from '../../modules/orderModule/infrastructure/repositories/orderRepository/orderEntity/orderEntity';
import { OrderModule } from '../../modules/orderModule/orderModule';
import { ReviewEntity } from '../../modules/reviewModule/infrastructure/repositories/reviewRepository/reviewEntity/reviewEntity';
import { ReviewModule } from '../../modules/reviewModule/reviewModule';
import { TokenService } from '../../modules/userModule/application/services/tokenService/tokenService';
import { UserEntity } from '../../modules/userModule/infrastructure/repositories/userRepository/userEntity/userEntity';
import { UserEntityTestFactory } from '../../modules/userModule/tests/factories/userEntityTestFactory/userEntityTestFactory';
import { UserModuleConfigTestFactory } from '../../modules/userModule/tests/factories/userModuleConfigTestFactory/userModuleConfigTestFactory';
import { UserModule } from '../../modules/userModule/userModule';
import { userModuleSymbols } from '../../modules/userModule/userModuleSymbols';
import { WhishlistEntryEntity } from '../../modules/whishlistModule/infrastructure/repositories/whishlistEntryRepository/whishlistEntryEntity/whishlistEntryEntity';
import { WhishlistModule } from '../../modules/whishlistModule/whishlistModule';

const baseUrl = '/authors';

describe(`AuthorController (${baseUrl})`, () => {
  let authorRepositoryFactory: AuthorRepositoryFactory;
  let server: HttpServer;
  let tokenService: TokenService;
  let testTransactionRunner: TestTransactionExternalRunner;
  let dataSource: DataSource;

  const authorEntityTestFactory = new AuthorEntityTestFactory();
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
        new AuthorBookModule(),
        new LoggerModule(loggerModuleConfig),
        new BookCategoryModule(),
        new AddressModule(),
        new CustomerModule(),
        new UnitOfWorkModule(),
        new OrderModule(),
        new InventoryModule(),
        new ReviewModule(),
        new WhishlistModule(),
      ],
    });

    DependencyInjectionContainerFactory.create = jest.fn().mockResolvedValue(container);

    authorRepositoryFactory = container.get<AuthorRepositoryFactory>(authorModuleSymbols.authorRepositoryFactory);
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

  describe('Create author', () => {
    it('returns bad request when not all required properties in body are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId } = userEntityTestFactory.create();

        const { firstName } = authorEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId });

        const response = await request(server.instance)
          .post(baseUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            firstName,
          });

        expect(response.statusCode).toBe(HttpStatusCode.badRequest);
      });
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { firstName, lastName } = authorEntityTestFactory.create();

        const response = await request(server.instance).post(baseUrl).send({
          firstName,
          lastName,
        });

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('accepts a request and returns created when all required body properties are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId } = userEntityTestFactory.create();

        const { firstName, lastName } = authorEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId });

        const response = await request(server.instance)
          .post(baseUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            firstName,
            lastName,
          });

        expect(response.statusCode).toBe(HttpStatusCode.created);
      });
    });
  });

  describe('Find author', () => {
    it('returns not found when author with given authorId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId } = userEntityTestFactory.create();

        const { id } = authorEntityTestFactory.create();

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

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const { id, firstName, lastName, about } = authorEntityTestFactory.create();

        const author = await authorRepository.createOne({ id, firstName, lastName, about: about as string });

        const response = await request(server.instance).get(`${baseUrl}/${author.id}`);

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('accepts a request and returns ok when authorId is uuid and have corresponding author', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const { id: userId } = userEntityTestFactory.create();

        const { id, firstName, lastName, about } = authorEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId });

        const author = await authorRepository.createOne({ id, firstName, lastName, about: about as string });

        const response = await request(server.instance)
          .get(`${baseUrl}/${author.id}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.ok);
      });
    });
  });

  describe('Find authors', () => {
    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const response = await request(server.instance).get(`${baseUrl}`);

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('returns authors with filtering provided', async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const { id: userId } = userEntityTestFactory.create();

        const authorEntity1 = authorEntityTestFactory.create();

        const authorEntity2 = authorEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId });

        await authorRepository.createOne({
          id: authorEntity1.id,
          firstName: authorEntity1.firstName,
          lastName: authorEntity1.lastName,
          about: authorEntity1.about as string,
        });

        await authorRepository.createOne({
          id: authorEntity2.id,
          firstName: authorEntity2.firstName,
          lastName: authorEntity2.lastName,
          about: authorEntity2.about as string,
        });

        const response = await request(server.instance)
          .get(`${baseUrl}?filter=["firstName||eq||${authorEntity1.firstName}"]`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.ok);
        expect(response.body.data.authors.length).toBe(1);
      });
    });
  });

  describe('Update author', () => {
    it('returns bad request when provided not allowed properties in body', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId } = userEntityTestFactory.create();

        const { id, firstName } = authorEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId });

        const response = await request(server.instance)
          .patch(`${baseUrl}/${id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            firstName,
          });

        expect(response.statusCode).toBe(HttpStatusCode.badRequest);
      });
    });

    it('returns not found when author with given authorId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId } = userEntityTestFactory.create();

        const { id, about } = authorEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId });

        const response = await request(server.instance)
          .patch(`${baseUrl}/${id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            about,
          });

        expect(response.statusCode).toBe(HttpStatusCode.notFound);
      });
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const { id, firstName, lastName, about } = authorEntityTestFactory.create();

        const author = await authorRepository.createOne({ id, firstName, lastName });

        const response = await request(server.instance).patch(`${baseUrl}/${author.id}`).send({
          about,
        });

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('accepts a request and returns ok when authorId is uuid and corresponds to existing author', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const { id: userId } = userEntityTestFactory.create();

        const { id, firstName, lastName, about } = authorEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId });

        const author = await authorRepository.createOne({ id, firstName, lastName });

        const response = await request(server.instance)
          .patch(`${baseUrl}/${author.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            about,
          });

        expect(response.statusCode).toBe(HttpStatusCode.ok);
      });
    });
  });

  describe('Delete author', () => {
    it('returns not found when author with given authorId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId } = userEntityTestFactory.create();

        const { id } = authorEntityTestFactory.create();

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

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const { id, firstName, lastName } = authorEntityTestFactory.create();

        const author = await authorRepository.createOne({ id, firstName, lastName });

        const response = await request(server.instance).delete(`${baseUrl}/${author.id}`).send();

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('accepts a request and returns no content when authorId is uuid and corresponds to existing author', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const { id: userId } = userEntityTestFactory.create();

        const { id, firstName, lastName } = authorEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId });

        const author = await authorRepository.createOne({ id, firstName, lastName });

        const response = await request(server.instance)
          .delete(`${baseUrl}/${author.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send();

        expect(response.statusCode).toBe(HttpStatusCode.noContent);
      });
    });
  });
});
