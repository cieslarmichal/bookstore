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
import { OrderEntity } from '../../../domain/order/contracts/orderEntity';
import { OrderModule } from '../../../domain/order/orderModule';
import { ReviewEntity } from '../../../domain/review/contracts/reviewEntity';
import { ReviewModule } from '../../../domain/review/reviewModule';
import { UserRepositoryFactory } from '../../../domain/user/contracts/factories/userRepositoryFactory/userRepositoryFactory';
import { TokenService } from '../../../domain/user/contracts/services/tokenService/tokenService';
import { UserEntity } from '../../../domain/user/contracts/userEntity';
import { UserEntityTestFactory } from '../../../domain/user/tests/factories/userEntityTestFactory/userEntityTestFactory';
import { UserModuleConfigTestFactory } from '../../../domain/user/tests/factories/userModuleConfigTestFactory/userModuleConfigTestFactory';
import { UserModule } from '../../../domain/user/userModule';
import { userModuleSymbols } from '../../../domain/user/userModuleSymbols';
import { WhishlistEntryRepositoryFactory } from '../../../domain/whishlist/contracts/factories/whishlistEntryRepositoryFactory/whishlistEntryRepositoryFactory';
import { WhishlistEntryEntity } from '../../../domain/whishlist/contracts/whishlistEntryEntity';
import { WhishlistEntryEntityTestFactory } from '../../../domain/whishlist/tests/factories/whishlistEntryEntityTestFactory/whishlistEntryEntityTestFactory';
import { WhishlistModule } from '../../../domain/whishlist/whishlistModule';
import { whishlistSymbols } from '../../../domain/whishlist/whishlistSymbols';
import { IntegrationsModule } from '../../../integrations/integrationsModule';

const baseUrl = '/whishlist-entries';

describe(`WhishlistController (${baseUrl})`, () => {
  let whishlistEntryRepositoryFactory: WhishlistEntryRepositoryFactory;
  let customerRepositoryFactory: CustomerRepositoryFactory;
  let userRepositoryFactory: UserRepositoryFactory;
  let bookRepositoryFactory: BookRepositoryFactory;
  let server: HttpServer;
  let tokenService: TokenService;
  let testTransactionRunner: TestTransactionExternalRunner;
  let dataSource: DataSource;

  const whishlistEntryEntityTestFactory = new WhishlistEntryEntityTestFactory();
  const userEntityTestFactory = new UserEntityTestFactory();
  const customerEntityTestFactory = new CustomerEntityTestFactory();
  const bookEntityTestFactory = new BookEntityTestFactory();

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
    const container = DependencyInjectionContainerFactory.create({
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

    whishlistEntryRepositoryFactory = container.get<WhishlistEntryRepositoryFactory>(
      whishlistSymbols.whishlistEntryRepositoryFactory,
    );
    userRepositoryFactory = container.get<UserRepositoryFactory>(userModuleSymbols.userRepositoryFactory);
    customerRepositoryFactory = container.get<CustomerRepositoryFactory>(customerSymbols.customerRepositoryFactory);
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

  describe('Create whishlist entry', () => {
    it('returns bad request when not all required properties in body are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId } = userEntityTestFactory.create();

        const { customerId } = whishlistEntryEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId });

        const response = await request(server.instance)
          .post(baseUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            customerId,
          });

        expect(response.statusCode).toBe(HttpStatusCode.badRequest);
      });
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { bookId, customerId } = whishlistEntryEntityTestFactory.create();

        const response = await request(server.instance).post(baseUrl).send({
          bookId,
          customerId,
        });

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('accepts a request and returns created when all required body properties are provided and book and customer with given id exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { id: userId, email, password } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const bookEntity = bookEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId });

        const book = await bookRepository.createOne({
          id: bookEntity.id,
          format: bookEntity.format,
          language: bookEntity.language,
          price: bookEntity.price,
          title: bookEntity.title,
          isbn: bookEntity.isbn,
          releaseYear: bookEntity.releaseYear,
        });

        const user = await userRepository.createOne({ id: userId, email: email as string, password });

        const customer = await customerRepository.createOne({ id: customerId, userId: user.id });

        const response = await request(server.instance)
          .post(baseUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            bookId: book.id,
            customerId: customer.id,
          });

        expect(response.statusCode).toBe(HttpStatusCode.created);
      });
    });
  });

  describe('Find whishlist entries', () => {
    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const response = await request(server.instance).get(`${baseUrl}`);

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('accepts request and returns whishlist entries', async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const whishlistEntryRepository = whishlistEntryRepositoryFactory.create(entityManager);

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { id: userId, email, password } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const { id: whishlistEntryId } = whishlistEntryEntityTestFactory.create();

        const bookEntity = bookEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId });

        const book = await bookRepository.createOne({
          id: bookEntity.id,
          format: bookEntity.format,
          language: bookEntity.language,
          price: bookEntity.price,
          title: bookEntity.title,
          isbn: bookEntity.isbn,
          releaseYear: bookEntity.releaseYear,
        });

        const user = await userRepository.createOne({ id: userId, email: email as string, password });

        const customer = await customerRepository.createOne({ id: customerId, userId: user.id });

        await whishlistEntryRepository.createOne({
          id: whishlistEntryId,
          bookId: book.id,
          customerId: customer.id,
        });

        const response = await request(server.instance)
          .get(`${baseUrl}?customerId=${customer.id}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.ok);
        expect(response.body.data.whishlistEntries.length).toBe(1);
      });
    });
  });

  describe('Delete whishlist entry', () => {
    it('returns not found when whishlist entry with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const { id } = whishlistEntryEntityTestFactory.create();

        const { id: userId, email, password } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId });

        const user = await userRepository.createOne({ id: userId, email: email as string, password });

        await customerRepository.createOne({ id: customerId, userId: user.id });

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

        const whishlistEntryRepository = whishlistEntryRepositoryFactory.create(entityManager);

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { id: userId, email, password } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const { id: whishlistEntryId } = whishlistEntryEntityTestFactory.create();

        const bookEntity = bookEntityTestFactory.create();

        const book = await bookRepository.createOne({
          id: bookEntity.id,
          format: bookEntity.format,
          language: bookEntity.language,
          price: bookEntity.price,
          title: bookEntity.title,
          isbn: bookEntity.isbn,
          releaseYear: bookEntity.releaseYear,
        });

        const user = await userRepository.createOne({ id: userId, email: email as string, password });

        const customer = await customerRepository.createOne({ id: customerId, userId: user.id });

        const whishlistEntry = await whishlistEntryRepository.createOne({
          id: whishlistEntryId,
          bookId: book.id,
          customerId: customer.id,
        });

        const response = await request(server.instance).delete(`${baseUrl}/${whishlistEntry.id}`).send();

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('accepts a request and returns no content id corresponds to existing whishlist entry', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const whishlistEntryRepository = whishlistEntryRepositoryFactory.create(entityManager);

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { id: userId, email, password } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const { id: whishlistEntryId } = whishlistEntryEntityTestFactory.create();

        const bookEntity = bookEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId });

        const book = await bookRepository.createOne({
          id: bookEntity.id,
          format: bookEntity.format,
          language: bookEntity.language,
          price: bookEntity.price,
          title: bookEntity.title,
          isbn: bookEntity.isbn,
          releaseYear: bookEntity.releaseYear,
        });

        const user = await userRepository.createOne({ id: userId, email: email as string, password });

        const customer = await customerRepository.createOne({ id: customerId, userId: user.id });

        const whishlistEntry = await whishlistEntryRepository.createOne({
          id: whishlistEntryId,
          bookId: book.id,
          customerId: customer.id,
        });

        const response = await request(server.instance)
          .delete(`${baseUrl}/${whishlistEntry.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send();

        expect(response.statusCode).toBe(HttpStatusCode.noContent);
      });
    });
  });
});
