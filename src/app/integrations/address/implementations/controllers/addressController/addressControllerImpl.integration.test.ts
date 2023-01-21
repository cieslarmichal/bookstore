import { ConfigLoader } from '../../../../../../configLoader';
import { AddressEntityTestFactory } from '../../../../../domain/address/tests/factories/addressEntityTestFactory/addressEntityTestFactory';
import request from 'supertest';
import { App } from '../../../../../../app';
import { AddressModule } from '../../../../../domain/address/addressModule';
import { IntegrationsModule } from '../../../../integrationsModule';
import { BookModule } from '../../../../../domain/book/bookModule';
import { Server } from '../../../../../../server';
import { UserEntityTestFactory } from '../../../../../domain/user/tests/factories/userEntityTestFactory/userEntityTestFactory';
import { StatusCodes } from 'http-status-codes';
import { UserModule } from '../../../../../domain/user/userModule';
import { AuthorModule } from '../../../../../domain/author/authorModule';
import { AuthorBookModule } from '../../../../../domain/authorBook/authorBookModule';
import { BookCategoryModule } from '../../../../../domain/bookCategory/bookCategoryModule';
import { CategoryModule } from '../../../../../domain/category/categoryModule';
import { CustomerModule } from '../../../../../domain/customer/customerModule';
import { AddressRepositoryFactory } from '../../../../../domain/address/contracts/factories/addressRepositoryFactory/addressRepositoryFactory';
import { CustomerRepositoryFactory } from '../../../../../domain/customer/contracts/factories/customerRepositoryFactory/customerRepositoryFactory';
import { UserRepositoryFactory } from '../../../../../domain/user/contracts/factories/userRepositoryFactory/userRepositoryFactory';
import { createDependencyInjectionContainer } from '../../../../../libs/dependencyInjection/container';
import { LoggerModule } from '../../../../../libs/logger/loggerModule';
import { UnitOfWorkModule } from '../../../../../libs/unitOfWork/unitOfWorkModule';
import { AuthHelper, TestTransactionExternalRunner } from '../../../../../tests/helpers';
import { postgresConnector } from '../../../../../libs/postgres/postgresConnector';
import { PostgresModule } from '../../../../../libs/postgres/postgresModule';
import { addressSymbols } from '../../../../../domain/address/addressSymbols';
import { userSymbols } from '../../../../../domain/user/userSymbols';
import { customerSymbols } from '../../../../../domain/customer/customerSymbols';

const baseUrl = '/addresses';

describe(`AddressControllerImpl (${baseUrl})`, () => {
  let addressRepositoryFactory: AddressRepositoryFactory;
  let customerRepositoryFactory: CustomerRepositoryFactory;
  let userRepositoryFactory: UserRepositoryFactory;
  let addressTestFactory: AddressEntityTestFactory;
  let userEntityTestFactory: UserEntityTestFactory;
  let server: Server;
  let authHelper: AuthHelper;
  let testTransactionRunner: TestTransactionExternalRunner;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    addressTestFactory = new AddressEntityTestFactory();
    userEntityTestFactory = new UserEntityTestFactory();
  });

  beforeEach(async () => {
    const container = await createDependencyInjectionContainer([
      PostgresModule,
      AddressModule,
      BookModule,
      AuthorModule,
      UserModule,
      IntegrationsModule,
      AuthorBookModule,
      LoggerModule,
      BookCategoryModule,
      CategoryModule,
      CustomerModule,
      UnitOfWorkModule,
    ]);

    addressRepositoryFactory = container.resolve(addressSymbols.addressRepositoryFactory);
    userRepositoryFactory = container.resolve(userSymbols.userRepositoryFactory);
    customerRepositoryFactory = container.resolve(customerSymbols.customerRepositoryFactory);

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

  describe('Create address', () => {
    it('returns bad request when not all required properties in body are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.create();

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

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const { email, password, role } = userEntityTestFactory.create();

        const user = await userRepository.createOne({ email, password, role });

        const customer = await customerRepository.createOne({ userId: user.id });

        const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress } =
          addressTestFactory.generateData();

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

        expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      });
    });

    it('accepts a request and returns created when all required body properties are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const { email, password, id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const user = await userRepository.createOne({ email, password, role });

        const customer = await customerRepository.createOne({ userId: user.id });

        const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress } =
          addressTestFactory.generateData();

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

        expect(response.statusCode).toBe(StatusCodes.CREATED);
      });
    });
  });

  describe('Find address', () => {
    it('returns bad request the addressId param is not uuid', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const addressId = 'abc';

        const response = await request(server.instance)
          .get(`${baseUrl}/${addressId}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
      });
    });

    it('returns not found when address with given addressId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const { email, password, role } = userEntityTestFactory.create();

        const user = await userRepository.createOne({ email, password, role });

        const accessToken = authHelper.mockAuth({ userId: user.id, role });

        await customerRepository.createOne({ userId: user.id });

        const { id } = addressTestFactory.generateData();

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

        const addressRepository = addressRepositoryFactory.create(entityManager);

        const { email, password, role } = userEntityTestFactory.create();

        const user = await userRepository.createOne({ email, password, role });

        const customer = await customerRepository.createOne({ userId: user.id });

        const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress } =
          addressTestFactory.generateData();

        const address = await addressRepository.createOne({
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

        expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      });
    });

    it(`returns forbidden when user requests other customer's address`, async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const addressRepository = addressRepositoryFactory.create(entityManager);

        const { email, password, id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const user = await userRepository.createOne({ email, password, role });

        const customer = await customerRepository.createOne({ userId: user.id });

        const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress } =
          addressTestFactory.generateData();

        const address = await addressRepository.createOne({
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

        expect(response.statusCode).toBe(StatusCodes.FORBIDDEN);
      });
    });

    it('accepts a request and returns ok when addressId is uuid and have corresponding address', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const addressRepository = addressRepositoryFactory.create(entityManager);

        const { email, password, role } = userEntityTestFactory.create();

        const user = await userRepository.createOne({ email, password, role });

        const accessToken = authHelper.mockAuth({ userId: user.id, role });

        const customer = await customerRepository.createOne({ userId: user.id });

        const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress } =
          addressTestFactory.generateData();

        const address = await addressRepository.createOne({
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

        expect(response.statusCode).toBe(StatusCodes.OK);
      });
    });
  });

  describe('Find addresses', () => {
    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const response = await request(server.instance).get(`${baseUrl}`);

        expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      });
    });

    it('returns addresses with filtering provided', async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const addressRepository = addressRepositoryFactory.create(entityManager);

        const { email, password, id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const user1 = await userRepository.createOne({ email, password, role });

        const { email: otherEmail } = userEntityTestFactory.create();

        const user2 = await userRepository.createOne({ email: otherEmail, password, role });

        const customer1 = await customerRepository.createOne({ userId: user1.id });

        const customer2 = await customerRepository.createOne({ userId: user2.id });

        const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress } =
          addressTestFactory.generateData();

        await addressRepository.createOne({
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

        expect(response.statusCode).toBe(StatusCodes.OK);
        expect(response.body.data.addresses.length).toBe(1);
      });
    });
  });

  describe('Remove address', () => {
    it('returns bad request when the addressId param is not uuid', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const addressId = 'abc';

        const response = await request(server.instance)
          .delete(`${baseUrl}/${addressId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send();

        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
      });
    });

    it('returns not found when address with given addressId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { id } = addressTestFactory.generateData();

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

        const addressRepository = addressRepositoryFactory.create(entityManager);

        const { email, password, role } = userEntityTestFactory.create();

        const user = await userRepository.createOne({ email, password, role });

        const customer = await customerRepository.createOne({ userId: user.id });

        const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress } =
          addressTestFactory.generateData();

        const address = await addressRepository.createOne({
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

        expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      });
    });

    it('accepts a request and returns no content when addressId is uuid and corresponds to existing address', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const addressRepository = addressRepositoryFactory.create(entityManager);

        const { email, password, id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const user = await userRepository.createOne({ email, password, role });

        const customer = await customerRepository.createOne({ userId: user.id });

        const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress } =
          addressTestFactory.generateData();

        const address = await addressRepository.createOne({
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

        expect(response.statusCode).toBe(StatusCodes.NO_CONTENT);
      });
    });
  });
});
