import 'reflect-metadata';

import request from 'supertest';
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';

import { HttpServer } from '../../../../../../server/httpServer';
import { HttpServerConfigTestFactory } from '../../../../../../server/tests/factories/httpServerConfigTestFactory/httpServerConfigTestFactory';
import { App } from '../../../../../app';
import { HttpStatusCode } from '../../../../../common/http/httpStatusCode';
import { SpyFactory } from '../../../../../common/testFactories/spyFactory';
import { AddressModule } from '../../../../../domain/address/addressModule';
import { addressSymbols } from '../../../../../domain/address/addressSymbols';
import { AddressRepositoryFactory } from '../../../../../domain/address/contracts/factories/addressRepositoryFactory/addressRepositoryFactory';
import { AddressEntityTestFactory } from '../../../../../domain/address/tests/factories/addressEntityTestFactory/addressEntityTestFactory';
import { AuthorModule } from '../../../../../domain/author/authorModule';
import { AuthorBookModule } from '../../../../../domain/authorBook/authorBookModule';
import { BookModule } from '../../../../../domain/book/bookModule';
import { BookCategoryModule } from '../../../../../domain/bookCategory/bookCategoryModule';
import { CategoryModule } from '../../../../../domain/category/categoryModule';
import { CustomerRepositoryFactory } from '../../../../../domain/customer/contracts/factories/customerRepositoryFactory/customerRepositoryFactory';
import { CustomerModule } from '../../../../../domain/customer/customerModule';
import { customerSymbols } from '../../../../../domain/customer/customerSymbols';
import { CustomerEntityTestFactory } from '../../../../../domain/customer/tests/factories/customerEntityTestFactory/customerEntityTestFactory';
import { UserRepositoryFactory } from '../../../../../domain/user/contracts/factories/userRepositoryFactory/userRepositoryFactory';
import { UserEntityTestFactory } from '../../../../../domain/user/tests/factories/userEntityTestFactory/userEntityTestFactory';
import { UserModuleConfigTestFactory } from '../../../../../domain/user/tests/factories/userModuleConfigTestFactory/userModuleConfigTestFactory';
import { UserModule } from '../../../../../domain/user/userModule';
import { userSymbols } from '../../../../../domain/user/userSymbols';
import { DependencyInjectionContainerFactory } from '../../../../../libs/dependencyInjection/implementations/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../../../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../../../../libs/logger/loggerModuleConfigTestFactory';
import { PostgresConnector } from '../../../../../libs/postgres/postgresConnector';
import { PostgresModule } from '../../../../../libs/postgres/postgresModule';
import { PostgresModuleConfigTestFactory } from '../../../../../libs/postgres/postgresModuleConfigTestFactory';
import { postgresSymbols } from '../../../../../libs/postgres/postgresSymbols';
import { UnitOfWorkModule } from '../../../../../libs/unitOfWork/unitOfWorkModule';
import { AuthHelper } from '../../../../common/tests/auth/authHelper';
import { TestTransactionExternalRunner } from '../../../../common/tests/unitOfWork/testTransactionExternalRunner';
import { IntegrationsModule } from '../../../../integrationsModule';

const baseUrl = '/addresses';

describe(`AddressController (${baseUrl})`, () => {
  const spyFactory = new SpyFactory(vi);

  let addressRepositoryFactory: AddressRepositoryFactory;
  let customerRepositoryFactory: CustomerRepositoryFactory;
  let userRepositoryFactory: UserRepositoryFactory;

  let server: HttpServer;
  let authHelper: AuthHelper;
  let testTransactionRunner: TestTransactionExternalRunner;
  let postgresConnector: PostgresConnector;

  const addressEntityTestFactory = new AddressEntityTestFactory();
  const userEntityTestFactory = new UserEntityTestFactory();
  const customerEntityTestFactory = new CustomerEntityTestFactory();

  const loggerModuleConfig = new LoggerModuleConfigTestFactory().create();
  const postgresModuleConfig = new PostgresModuleConfigTestFactory().create();
  const userModuleConfig = new UserModuleConfigTestFactory().create();
  const httpServerConfig = new HttpServerConfigTestFactory().create();

  beforeEach(async () => {
    const container = await DependencyInjectionContainerFactory.create([
      new PostgresModule(postgresModuleConfig),
      new AddressModule(),
      new BookModule(),
      new AuthorModule(),
      new UserModule(userModuleConfig),
      new IntegrationsModule(),
      new AuthorBookModule(),
      new LoggerModule(loggerModuleConfig),
      new BookCategoryModule(),
      new CategoryModule(),
      new CustomerModule(),
      new UnitOfWorkModule(),
    ]);

    addressRepositoryFactory = container.resolve(addressSymbols.addressRepositoryFactory);
    userRepositoryFactory = container.resolve(userSymbols.userRepositoryFactory);
    customerRepositoryFactory = container.resolve(customerSymbols.customerRepositoryFactory);
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

  describe('Create address', () => {
    it('returns bad request when not all required properties in body are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const response = await request(server.instance)
          .post(baseUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({});

        expect(response.statusCode).toBe(HttpStatusCode.badRequest);
      });
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const { id: userId, email, password, role } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const user = await userRepository.createOne({ id: userId, email: email as string, password, role });

        const customer = await customerRepository.createOne({ id: customerId, userId: user.id });

        const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress } =
          addressEntityTestFactory.create();

        const response = await request(server.instance).post(baseUrl).send({
          firstName,
          lastName,
          phoneNumber,
          country,
          state,
          city,
          zipCode,
          streetAddress,
          customerId: customer.id,
        });

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('accepts a request and returns created when all required body properties are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const { id: userId, email, password, role } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const user = await userRepository.createOne({ id: userId, email: email as string, password, role });

        const customer = await customerRepository.createOne({ id: customerId, userId: user.id });

        const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress } =
          addressEntityTestFactory.create();

        const response = await request(server.instance)
          .post(baseUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            firstName,
            lastName,
            phoneNumber,
            country,
            state,
            city,
            zipCode,
            streetAddress,
            customerId: customer.id,
          });

        expect(response.statusCode).toBe(HttpStatusCode.created);
      });
    });
  });

  describe('Find address', () => {
    it('returns bad request the addressId param is not uuid', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const addressId = 'abc';

        const response = await request(server.instance)
          .get(`${baseUrl}/${addressId}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.badRequest);
      });
    });

    it('returns not found when address with given addressId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const { id: userId, email, password, role } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const user = await userRepository.createOne({ id: userId, email: email as string, password, role });

        await customerRepository.createOne({ id: customerId, userId: user.id });

        const { id } = addressEntityTestFactory.create();

        const response = await request(server.instance)
          .get(`${baseUrl}/${id}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.notFound);
      });
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const addressRepository = addressRepositoryFactory.create(entityManager);

        const { id: userId, email, password, role } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const {
          id: addressId,
          firstName,
          lastName,
          phoneNumber,
          country,
          state,
          city,
          zipCode,
          streetAddress,
        } = addressEntityTestFactory.create();

        const user = await userRepository.createOne({ id: userId, email: email as string, password, role });

        const customer = await customerRepository.createOne({ id: customerId, userId: user.id });

        const address = await addressRepository.createOne({
          id: addressId,
          firstName,
          lastName,
          phoneNumber,
          country,
          state,
          city,
          zipCode,
          streetAddress,
          customerId: customer.id,
        });

        const response = await request(server.instance).get(`${baseUrl}/${address.id}`);

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it(`returns forbidden when user requests other customer's address`, async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const addressRepository = addressRepositoryFactory.create(entityManager);

        const { id: userId, email, password, role } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const {
          id: addressId,
          firstName,
          lastName,
          phoneNumber,
          country,
          state,
          city,
          zipCode,
          streetAddress,
        } = addressEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const user = await userRepository.createOne({ id: userId, email: email as string, password, role });

        const customer = await customerRepository.createOne({ id: customerId, userId: user.id });

        const address = await addressRepository.createOne({
          id: addressId,
          firstName,
          lastName,
          phoneNumber,
          country,
          state,
          city,
          zipCode,
          streetAddress,
          customerId: customer.id,
        });

        const response = await request(server.instance)
          .get(`${baseUrl}/${address.id}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.forbidden);
      });
    });

    it('accepts a request and returns ok when addressId is uuid and have corresponding address', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const addressRepository = addressRepositoryFactory.create(entityManager);

        const { id: userId, email, password, role } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const {
          id: addressId,
          firstName,
          lastName,
          phoneNumber,
          country,
          state,
          city,
          zipCode,
          streetAddress,
        } = addressEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const user = await userRepository.createOne({ id: userId, email: email as string, password, role });

        const customer = await customerRepository.createOne({ id: customerId, userId: user.id });

        const address = await addressRepository.createOne({
          id: addressId,
          firstName,
          lastName,
          phoneNumber,
          country,
          state,
          city,
          zipCode,
          streetAddress,
          customerId: customer.id,
        });

        const response = await request(server.instance)
          .get(`${baseUrl}/${address.id}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.ok);
      });
    });
  });

  describe('Find addresses', () => {
    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async () => {
        const response = await request(server.instance).get(`${baseUrl}`);

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('returns addresses with filtering provided', async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const addressRepository = addressRepositoryFactory.create(entityManager);

        const { id: userId1, email: email1, password, role } = userEntityTestFactory.create();

        const { id: userId2, email: email2 } = userEntityTestFactory.create();

        const { id: customerId1 } = customerEntityTestFactory.create();

        const { id: customerId2 } = customerEntityTestFactory.create();

        const {
          id: addressId1,
          firstName,
          lastName,
          phoneNumber,
          country,
          state,
          city,
          zipCode,
          streetAddress,
        } = addressEntityTestFactory.create();

        const { id: addressId2 } = addressEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId: userId1, role });

        const user1 = await userRepository.createOne({ id: userId1, email: email1 as string, password, role });

        const user2 = await userRepository.createOne({ id: userId2, email: email2 as string, password, role });

        const customer1 = await customerRepository.createOne({ id: customerId1, userId: user1.id });

        const customer2 = await customerRepository.createOne({ id: customerId2, userId: user2.id });

        await addressRepository.createOne({
          id: addressId1,
          firstName,
          lastName,
          phoneNumber,
          country,
          state,
          city,
          zipCode,
          streetAddress,
          customerId: customer1.id,
        });

        await addressRepository.createOne({
          id: addressId2,
          firstName,
          lastName,
          phoneNumber,
          country,
          state,
          city,
          zipCode,
          streetAddress,
          customerId: customer2.id,
        });

        const response = await request(server.instance)
          .get(`${baseUrl}?filter=["customerId||eq||${customer1.id}"]`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.ok);
        expect(response.body.data.addresses.length).toBe(1);
      });
    });
  });

  describe('Delete address', () => {
    it('returns bad request when the addressId param is not uuid', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const addressId = 'abc';

        const response = await request(server.instance)
          .delete(`${baseUrl}/${addressId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send();

        expect(response.statusCode).toBe(HttpStatusCode.badRequest);
      });
    });

    it('returns not found when address with given addressId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { id } = addressEntityTestFactory.create();

        const response = await request(server.instance)
          .delete(`${baseUrl}/${id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send();

        expect(response.statusCode).toBe(HttpStatusCode.notFound);
      });
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const addressRepository = addressRepositoryFactory.create(entityManager);

        const { id: userId, email, password, role } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const {
          id: addressId,
          firstName,
          lastName,
          phoneNumber,
          country,
          state,
          city,
          zipCode,
          streetAddress,
        } = addressEntityTestFactory.create();

        const user = await userRepository.createOne({ id: userId, email: email as string, password, role });

        const customer = await customerRepository.createOne({ id: customerId, userId: user.id });

        const address = await addressRepository.createOne({
          id: addressId,
          firstName,
          lastName,
          phoneNumber,
          country,
          state,
          city,
          zipCode,
          streetAddress,
          customerId: customer.id,
        });

        const response = await request(server.instance).delete(`${baseUrl}/${address.id}`).send();

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('accepts a request and returns no content when addressId is uuid and corresponds to existing address', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const addressRepository = addressRepositoryFactory.create(entityManager);

        const { id: userId, email, password, role } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const {
          id: addressId,
          firstName,
          lastName,
          phoneNumber,
          country,
          state,
          city,
          zipCode,
          streetAddress,
        } = addressEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const user = await userRepository.createOne({ id: userId, email: email as string, password, role });

        const customer = await customerRepository.createOne({ id: customerId, userId: user.id });

        const address = await addressRepository.createOne({
          id: addressId,
          firstName,
          lastName,
          phoneNumber,
          country,
          state,
          city,
          zipCode,
          streetAddress,
          customerId: customer.id,
        });

        const response = await request(server.instance)
          .delete(`${baseUrl}/${address.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send();

        expect(response.statusCode).toBe(HttpStatusCode.noContent);
      });
    });
  });
});
