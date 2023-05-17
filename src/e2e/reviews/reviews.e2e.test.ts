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
import { CategoryEntity } from '../../../domain/category/contracts/categoryEntity';
import { CustomerEntity } from '../../../domain/customer/contracts/customerEntity';
import { CustomerRepositoryFactory } from '../../../domain/customer/contracts/factories/customerRepositoryFactory/customerRepositoryFactory';
import { CustomerModule } from '../../../domain/customer/customerModule';
import { customerSymbols } from '../../../domain/customer/customerSymbols';
import { CustomerEntityTestFactory } from '../../../domain/customer/tests/factories/customerEntityTestFactory/customerEntityTestFactory';
import { InventoryEntity } from '../../../domain/inventory/contracts/inventoryEntity';
import { InventoryModule } from '../../../domain/inventory/inventoryModule';
import { LineItemEntity } from '../../../domain/lineItem/contracts/lineItemEntity';
import { LineItemModule } from '../../../domain/lineItem/lineItemModule';
import { OrderEntity } from '../../../domain/order/contracts/orderEntity';
import { OrderModule } from '../../../domain/order/orderModule';
import { ReviewRepositoryFactory } from '../../../domain/review/contracts/factories/reviewRepositoryFactory/reviewRepositoryFactory';
import { ReviewEntity } from '../../../domain/review/contracts/reviewEntity';
import { ReviewModule } from '../../../domain/review/reviewModule';
import { reviewSymbols } from '../../../domain/review/reviewSymbols';
import { ReviewEntityTestFactory } from '../../../domain/review/tests/factories/reviewEntityTestFactory/reviewEntityTestFactory';
import { UserRepositoryFactory } from '../../../domain/user/contracts/factories/userRepositoryFactory/userRepositoryFactory';
import { TokenService } from '../../../domain/user/contracts/services/tokenService/tokenService';
import { UserEntity } from '../../../domain/user/contracts/userEntity';
import { UserEntityTestFactory } from '../../../domain/user/tests/factories/userEntityTestFactory/userEntityTestFactory';
import { UserModuleConfigTestFactory } from '../../../domain/user/tests/factories/userModuleConfigTestFactory/userModuleConfigTestFactory';
import { UserModule } from '../../../domain/user/userModule';
import { userModuleSymbols } from '../../../domain/user/userModuleSymbols';
import { WhishlistEntryEntity } from '../../../domain/whishlist/contracts/whishlistEntryEntity';
import { WhishlistModule } from '../../../domain/whishlist/whishlistModule';
import { IntegrationsModule } from '../../../integrations/integrationsModule';

const baseUrl = '/reviews';

describe(`ReviewController (${baseUrl})`, () => {
  let reviewRepositoryFactory: ReviewRepositoryFactory;
  let customerRepositoryFactory: CustomerRepositoryFactory;
  let userRepositoryFactory: UserRepositoryFactory;
  let server: HttpServer;
  let tokenService: TokenService;
  let testTransactionRunner: TestTransactionExternalRunner;
  let dataSource: DataSource;

  const reviewEntityTestFactory = new ReviewEntityTestFactory();
  const userEntityTestFactory = new UserEntityTestFactory();
  const customerEntityTestFactory = new CustomerEntityTestFactory();

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

    reviewRepositoryFactory = container.get<ReviewRepositoryFactory>(reviewSymbols.reviewRepositoryFactory);
    userRepositoryFactory = container.get<UserRepositoryFactory>(userModuleSymbols.userRepositoryFactory);
    customerRepositoryFactory = container.get<CustomerRepositoryFactory>(customerSymbols.customerRepositoryFactory);
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

  describe('Create review', () => {
    it('returns bad request when not all required properties in body are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId } = userEntityTestFactory.create();

        const { isbn } = reviewEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId });

        const response = await request(server.instance)
          .post(baseUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            isbn,
          });

        expect(response.statusCode).toBe(HttpStatusCode.badRequest);
      });
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { isbn, rate, comment } = reviewEntityTestFactory.create();

        const response = await request(server.instance).post(baseUrl).send({
          isbn,
          rate,
          comment,
        });

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('accepts a request and returns created when all required body properties are provided and author with given id exists', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const { isbn, rate, comment } = reviewEntityTestFactory.create();

        const { id: userId, email, password } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId });

        const user = await userRepository.createOne({ id: userId, email: email as string, password });

        await customerRepository.createOne({ id: customerId, userId: user.id });

        const response = await request(server.instance)
          .post(baseUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            isbn,
            rate,
            comment,
          });

        expect(response.statusCode).toBe(HttpStatusCode.created);
      });
    });
  });

  describe('Find review', () => {
    it('returns not found when review with given reviewId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId } = userEntityTestFactory.create();

        const { id } = reviewEntityTestFactory.create();

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

        const reviewRepository = reviewRepositoryFactory.create(entityManager);

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const { id, isbn, rate, comment } = reviewEntityTestFactory.create();

        const { id: userId, email, password } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const user = await userRepository.createOne({ id: userId, email: email as string, password });

        const customer = await customerRepository.createOne({ id: customerId, userId: user.id });

        const review = await reviewRepository.createOne({
          id,
          isbn,
          rate,
          comment: comment as string,
          customerId: customer.id,
        });

        const response = await request(server.instance).get(`${baseUrl}/${review.id}`);

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('accepts a request and returns ok when reviewId is uuid and have corresponding review', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const reviewRepository = reviewRepositoryFactory.create(entityManager);

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const { id, isbn, rate, comment } = reviewEntityTestFactory.create();

        const { id: userId, email, password } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId });

        const user = await userRepository.createOne({ id: userId, email: email as string, password });

        const customer = await customerRepository.createOne({ id: customerId, userId: user.id });

        const review = await reviewRepository.createOne({
          id,
          isbn,
          rate,
          comment: comment as string,
          customerId: customer.id,
        });

        const response = await request(server.instance)
          .get(`${baseUrl}/${review.id}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.ok);
      });
    });
  });

  describe('Find reviews', () => {
    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const response = await request(server.instance).get(`${baseUrl}`);

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('accepts request and returns reviews', async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const reviewRepository = reviewRepositoryFactory.create(entityManager);

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const { id, isbn, rate, comment } = reviewEntityTestFactory.create();

        const { id: userId, email, password } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId });

        const user = await userRepository.createOne({ id: userId, email: email as string, password });

        const customer = await customerRepository.createOne({ id: customerId, userId: user.id });

        await reviewRepository.createOne({
          id,
          isbn,
          rate,
          comment: comment as string,
          customerId: customer.id,
        });

        const response = await request(server.instance)
          .get(`${baseUrl}?customerId=${customer.id}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.ok);
        expect(response.body.data.reviews.length).toBe(1);
      });
    });
  });

  describe('Update review', () => {
    it('returns not found when review with given reviewId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const { id, rate } = reviewEntityTestFactory.create();

        const { id: userId, email, password } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId });

        const user = await userRepository.createOne({ id: userId, email: email as string, password });

        await customerRepository.createOne({ id: customerId, userId: user.id });

        const response = await request(server.instance)
          .patch(`${baseUrl}/${id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            rate,
          });

        expect(response.statusCode).toBe(HttpStatusCode.notFound);
      });
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const reviewRepository = reviewRepositoryFactory.create(entityManager);

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const { id, isbn, rate, comment } = reviewEntityTestFactory.create();

        const { rate: updatedRate } = reviewEntityTestFactory.create();

        const { id: userId, email, password } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const user = await userRepository.createOne({ id: userId, email: email as string, password });

        const customer = await customerRepository.createOne({ id: customerId, userId: user.id });

        const review = await reviewRepository.createOne({
          id,
          isbn,
          rate,
          comment: comment as string,
          customerId: customer.id,
        });

        const response = await request(server.instance).patch(`${baseUrl}/${review.id}`).send({
          price: updatedRate,
        });

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('accepts a request and returns ok when reviewId is uuid and corresponds to existing review', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const reviewRepository = reviewRepositoryFactory.create(entityManager);

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const { id, isbn, rate, comment } = reviewEntityTestFactory.create();

        const { rate: updatedRate } = reviewEntityTestFactory.create();

        const { id: userId, email, password } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId });

        const user = await userRepository.createOne({ id: userId, email: email as string, password });

        const customer = await customerRepository.createOne({ id: customerId, userId: user.id });

        const review = await reviewRepository.createOne({
          id,
          isbn,
          rate,
          comment: comment as string,
          customerId: customer.id,
        });

        const response = await request(server.instance)
          .patch(`${baseUrl}/${review.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            rate: updatedRate,
          });

        expect(response.statusCode).toBe(HttpStatusCode.ok);
      });
    });
  });

  describe('Delete review', () => {
    it('returns not found when review with given reviewId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const { id } = reviewEntityTestFactory.create();

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

        const reviewRepository = reviewRepositoryFactory.create(entityManager);

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const { id, isbn, rate, comment } = reviewEntityTestFactory.create();

        const { id: userId, email, password } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const user = await userRepository.createOne({ id: userId, email: email as string, password });

        const customer = await customerRepository.createOne({ id: customerId, userId: user.id });

        const review = await reviewRepository.createOne({
          id,
          isbn,
          rate,
          comment: comment as string,
          customerId: customer.id,
        });

        const response = await request(server.instance).delete(`${baseUrl}/${review.id}`).send();

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('accepts a request and returns no content when reviewId is uuid and corresponds to existing review', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const reviewRepository = reviewRepositoryFactory.create(entityManager);

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const { id, isbn, rate, comment } = reviewEntityTestFactory.create();

        const { id: userId, email, password } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId });

        const user = await userRepository.createOne({ id: userId, email: email as string, password });

        const customer = await customerRepository.createOne({ id: customerId, userId: user.id });

        const review = await reviewRepository.createOne({
          id,
          isbn,
          rate,
          comment: comment as string,
          customerId: customer.id,
        });

        const response = await request(server.instance)
          .delete(`${baseUrl}/${review.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send();

        expect(response.statusCode).toBe(HttpStatusCode.noContent);
      });
    });
  });
});
