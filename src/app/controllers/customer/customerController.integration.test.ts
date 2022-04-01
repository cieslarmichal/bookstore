import { ConfigLoader } from '../../../configLoader';
import { CustomerTestDataGenerator } from '../../domain/customer/testDataGenerators/customerTestDataGenerator';
import request from 'supertest';
import { App } from '../../../app';
import { createDIContainer, UnitOfWorkModule } from '../../shared';
import { DbModule } from '../../shared';
import { ControllersModule } from '../controllersModule';
import { BookModule } from '../../domain/book/bookModule';
import { Server } from '../../../server';
import { CustomerRepository } from '../../domain/customer/repositories/customerRepository';
import { UserTestDataGenerator } from '../../domain/user/testDataGenerators/userTestDataGenerator';
import { StatusCodes } from 'http-status-codes';
import { PostgresHelper } from '../../../integration/helpers/postgresHelper/postgresHelper';
import { AuthHelper } from '../../../integration/helpers';
import { UserModule } from '../../domain/user/userModule';
import { AuthorModule } from '../../domain/author/authorModule';
import { AuthorBookModule } from '../../domain/authorBook/authorBookModule';
import { LoggerModule } from '../../shared/logger/loggerModule';
import { BookCategoryModule } from '../../domain/bookCategory/bookCategoryModule';
import { CategoryModule } from '../../domain/category/categoryModule';
import { UserRepository } from '../../domain/user/repositories/userRepository';
import { USER_REPOSITORY_FACTORY } from '../../domain/user/userInjectionSymbols';
import { CUSTOMER_REPOSITORY_FACTORY } from '../../domain/customer/customerInjectionSymbols';
import { CustomerModule } from '../../domain/customer/customerModule';
import { AddressModule } from '../../domain/address/addressModule';
import { ENTITY_MANAGER } from 'src/app/shared/db/dbInjectionSymbols';

const baseUrl = '/customers';

describe(`CustomerController (${baseUrl})`, () => {
  let customerRepository: CustomerRepository;
  let userRepository: UserRepository;
  let customerTestDataGenerator: CustomerTestDataGenerator;
  let userTestDataGenerator: UserTestDataGenerator;
  let server: Server;
  let authHelper: AuthHelper;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    customerTestDataGenerator = new CustomerTestDataGenerator();
    userTestDataGenerator = new UserTestDataGenerator();
  });

  beforeEach(async () => {
    const container = await createDIContainer([
      DbModule,
      BookModule,
      AuthorModule,
      UserModule,
      ControllersModule,
      AuthorBookModule,
      LoggerModule,
      BookCategoryModule,
      CategoryModule,
      CustomerModule,
      AddressModule,
      UnitOfWorkModule,
    ]);

    const entityManager = container.resolve(ENTITY_MANAGER);

    customerRepository = container.resolve(CUSTOMER_REPOSITORY_FACTORY).create(entityManager);
    userRepository = container.resolve(USER_REPOSITORY_FACTORY).create(entityManager);

    authHelper = new AuthHelper(container);

    const app = new App(container);

    server = new Server(app.instance);

    server.listen();
  });

  afterEach(async () => {
    server.close();

    await PostgresHelper.removeDataFromTables();
  });

  describe('Create customer', () => {
    it('returns bad request when not all required properties in body are provided', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const response = await request(server.instance)
        .post(baseUrl)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const { email, password, role } = userTestDataGenerator.generateData();

      const user = await userRepository.createOne({ email, password, role });

      const response = await request(server.instance).post(baseUrl).send({ userId: user.id });

      expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
    });

    it('accepts a request and returns created when all required body properties are provided', async () => {
      expect.assertions(1);

      const { email, password, id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const user = await userRepository.createOne({ email, password, role });

      const response = await request(server.instance).post(baseUrl).set('Authorization', `Bearer ${accessToken}`).send({
        userId: user.id,
      });

      expect(response.statusCode).toBe(StatusCodes.CREATED);
    });
  });

  describe('Find customer', () => {
    it('returns bad request the customerId param is not uuid', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const customerId = 'abc';

      const response = await request(server.instance)
        .get(`${baseUrl}/${customerId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    it('returns not found when customer with given customerId does not exist', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const { id } = customerTestDataGenerator.generateData();

      const response = await request(server.instance)
        .get(`${baseUrl}/${id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const { email, password, role } = userTestDataGenerator.generateData();

      const user = await userRepository.createOne({ email, password, role });

      const customer = await customerRepository.createOne({ userId: user.id });

      const response = await request(server.instance).get(`${baseUrl}/${customer.id}`);

      expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
    });

    it('accepts a request and returns ok when customerId is uuid and have corresponding customer', async () => {
      expect.assertions(1);

      const { email, password, id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const user = await userRepository.createOne({ email, password, role });

      const customer = await customerRepository.createOne({ userId: user.id });

      const response = await request(server.instance)
        .get(`${baseUrl}/${customer.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(StatusCodes.OK);
    });
  });

  describe('Remove customer', () => {
    it('returns bad request when the customerId param is not uuid', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const customerId = 'abc';

      const response = await request(server.instance)
        .delete(`${baseUrl}/${customerId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send();

      expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    it('returns not found when customer with given customerId does not exist', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const { id } = customerTestDataGenerator.generateData();

      const response = await request(server.instance)
        .delete(`${baseUrl}/${id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send();

      expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const { email, password, role } = userTestDataGenerator.generateData();

      const user = await userRepository.createOne({ email, password, role });

      const customer = await customerRepository.createOne({ userId: user.id });

      const response = await request(server.instance).delete(`${baseUrl}/${customer.id}`).send();

      expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
    });

    it('accepts a request and returns no content when customerId is uuid and corresponds to existing customer', async () => {
      expect.assertions(1);

      const { email, password, id: userId, role } = userTestDataGenerator.generateData();

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
