import request from 'supertest';

import { StatusCodes } from 'http-status-codes';
import { App } from '../../../../../app';
import { ConfigLoader } from '../../../../../configLoader';
import { AddressModule } from '../../../../domain/address/addressModule';
import { AuthorModule } from '../../../../domain/author/authorModule';
import { AuthorBookModule } from '../../../../domain/authorBook/authorBookModule';
import { BookModule } from '../../../../domain/book/bookModule';
import { BookCategoryModule } from '../../../../domain/bookCategory/bookCategoryModule';
import { CategoryModule } from '../../../../domain/category/categoryModule';
import { CustomerRepositoryFactory } from '../../../../domain/customer/contracts/factories/customerRepositoryFactory/customerRepositoryFactory';
import { CustomerModule } from '../../../../domain/customer/customerModule';
import { CustomerEntityTestDataGenerator } from '../../../../domain/customer/tests/customerEntityTestDataGenerator/customerEntityTestDataGenerator';
import { UserRepositoryFactory } from '../../../../domain/user/contracts/factories/userRepositoryFactory/userRepositoryFactory';
import { UserEntityTestDataGenerator } from '../../../../domain/user/tests/userEntityTestDataGenerator/userEntityTestDataGenerator';
import { UserModule } from '../../../../domain/user/userModule';
import { createDependencyInjectionContainer } from '../../../../libs/dependencyInjection/container';
import { LoggerModule } from '../../../../libs/logger/loggerModule';
import { postgresConnector } from '../../../../libs/postgres/postgresConnector';
import { PostgresModule } from '../../../../libs/postgres/postgresModule';
import { UnitOfWorkModule } from '../../../../libs/unitOfWork/unitOfWorkModule';
import { AuthHelper, TestTransactionExternalRunner } from '../../../../tests/helpers';
import { IntegrationsModule } from '../../../integrationsModule';
import { Server } from '../../../../../server';

const baseUrl = '/customers';

describe(`CustomerControllerImpl (${baseUrl})`, () => {
  let customerRepositoryFactory: CustomerRepositoryFactory;
  let userRepositoryFactory: UserRepositoryFactory;
  let customerTestDataGenerator: CustomerEntityTestDataGenerator;
  let userEntityTestFactory: UserEntityTestDataGenerator;
  let server: Server;
  let authHelper: AuthHelper;
  let testTransactionRunner: TestTransactionExternalRunner;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    customerTestDataGenerator = new CustomerEntityTestDataGenerator();
    userEntityTestFactory = new UserEntityTestDataGenerator();
  });

  beforeEach(async () => {
    const container = await createDependencyInjectionContainer([
      PostgresModule,
      BookModule,
      AuthorModule,
      UserModule,
      IntegrationsModule,
      AuthorBookModule,
      LoggerModule,
      BookCategoryModule,
      CategoryModule,
      CustomerModule,
      AddressModule,
      UnitOfWorkModule,
    ]);

    customerRepositoryFactory = container.resolve(CUSTOMER_REPOSITORY_FACTORY);
    userRepositoryFactory = container.resolve(USER_REPOSITORY_FACTORY);

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

  describe('Create customer', () => {
    it('returns bad request when not all required properties in body are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.generateData();

        const accessToken = authHelper.mockAuth({ userId, role });

        const response = await request(server.instance)
          .post(baseUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({});

        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
      });
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const userRepository = userRepositoryFactory.create(entityManager);

        const { email, password, role } = userEntityTestFactory.generateData();

        const user = await userRepository.createOne({ email, password, role });

        const response = await request(server.instance).post(baseUrl).send({ userId: user.id });

        expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      });
    });

    it('accepts a request and returns created when all required body properties are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const userRepository = userRepositoryFactory.create(entityManager);

        const { email, password, id: userId, role } = userEntityTestFactory.generateData();

        const accessToken = authHelper.mockAuth({ userId, role });

        const user = await userRepository.createOne({ email, password, role });

        const response = await request(server.instance)
          .post(baseUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            userId: user.id,
          });

        expect(response.statusCode).toBe(StatusCodes.CREATED);
      });
    });
  });

  describe('Find customer', () => {
    it('returns bad request the customerId param is not uuid', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.generateData();

        const accessToken = authHelper.mockAuth({ userId, role });

        const customerId = 'abc';

        const response = await request(server.instance)
          .get(`${baseUrl}/${customerId}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
      });
    });

    it('returns not found when customer with given customerId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.generateData();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { id } = customerTestDataGenerator.generateData();

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

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const { email, password, role } = userEntityTestFactory.generateData();

        const user = await userRepository.createOne({ email, password, role });

        const customer = await customerRepository.createOne({ userId: user.id });

        const response = await request(server.instance).get(`${baseUrl}/${customer.id}`);

        expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      });
    });

    it('accepts a request and returns ok when customerId is uuid and have corresponding customer', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const { email, password, id: userId, role } = userEntityTestFactory.generateData();

        const accessToken = authHelper.mockAuth({ userId, role });

        const user = await userRepository.createOne({ email, password, role });

        const customer = await customerRepository.createOne({ userId: user.id });

        const response = await request(server.instance)
          .get(`${baseUrl}/${customer.id}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(StatusCodes.OK);
      });
    });
  });

  describe('Remove customer', () => {
    it('returns bad request when the customerId param is not uuid', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.generateData();

        const accessToken = authHelper.mockAuth({ userId, role });

        const customerId = 'abc';

        const response = await request(server.instance)
          .delete(`${baseUrl}/${customerId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send();

        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
      });
    });

    it('returns not found when customer with given customerId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.generateData();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { id } = customerTestDataGenerator.generateData();

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

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const { email, password, role } = userEntityTestFactory.generateData();

        const user = await userRepository.createOne({ email, password, role });

        const customer = await customerRepository.createOne({ userId: user.id });

        const response = await request(server.instance).delete(`${baseUrl}/${customer.id}`).send();

        expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      });
    });

    it('accepts a request and returns no content when customerId is uuid and corresponds to existing customer', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const { email, password, id: userId, role } = userEntityTestFactory.generateData();

        const accessToken = authHelper.mockAuth({ userId, role });

        const user = await userRepository.createOne({ email, password, role });

        const customer = await customerRepository.createOne({ userId: user.id });

        const response = await request(server.instance)
          .delete(`${baseUrl}/${customer.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send();

        expect(response.statusCode).toBe(StatusCodes.NO_CONTENT);
      });
    });
  });
});
