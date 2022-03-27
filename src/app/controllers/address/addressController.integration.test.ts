import { ConfigLoader } from '../../../configLoader';
import { AddressTestDataGenerator } from '../../domain/address/testDataGenerators/addressTestDataGenerator';
import request from 'supertest';
import { App } from '../../../app';
import { createDIContainer } from '../../shared';
import { DbModule } from '../../shared';
import { AddressModule } from '../../domain/address/addressModule';
import { ControllersModule } from '../controllersModule';
import { BookModule } from '../../domain/book/bookModule';
import { Server } from '../../../server';
import { AddressRepository } from '../../domain/address/repositories/addressRepository';
import { UserTestDataGenerator } from '../../domain/user/testDataGenerators/userTestDataGenerator';
import { StatusCodes } from 'http-status-codes';
import { PostgresHelper } from '../../../integration/helpers/postgresHelper/postgresHelper';
import { AuthHelper } from '../../../integration/helpers';
import { UserModule } from '../../domain/user/userModule';
import { AuthorModule } from '../../domain/author/authorModule';
import { AuthorBookModule } from '../../domain/authorBook/authorBookModule';
import { LoggerModule } from '../../shared/logger/loggerModule';
import { ADDRESS_REPOSITORY } from '../../domain/address/addressInjectionSymbols';
import { BookCategoryModule } from '../../domain/bookCategory/bookCategoryModule';
import { CategoryModule } from '../../domain/category/categoryModule';
import { UserRepository } from '../../domain/user/repositories/userRepository';
import { CustomerRepository } from '../../domain/customer/repositories/customerRepository';
import { USER_REPOSITORY } from '../../domain/user/userInjectionSymbols';
import { CUSTOMER_REPOSITORY } from '../../domain/customer/customerInjectionSymbols';
import { CustomerModule } from '../../domain/customer/customerModule';

const baseUrl = '/addresses';

describe(`AddressController (${baseUrl})`, () => {
  let addressRepository: AddressRepository;
  let customerRepository: CustomerRepository;
  let userRepository: UserRepository;
  let addressTestDataGenerator: AddressTestDataGenerator;
  let userTestDataGenerator: UserTestDataGenerator;
  let server: Server;
  let authHelper: AuthHelper;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    addressTestDataGenerator = new AddressTestDataGenerator();
    userTestDataGenerator = new UserTestDataGenerator();
  });

  beforeEach(async () => {
    const container = await createDIContainer([
      DbModule,
      AddressModule,
      BookModule,
      AuthorModule,
      UserModule,
      ControllersModule,
      AuthorBookModule,
      LoggerModule,
      BookCategoryModule,
      CategoryModule,
      CustomerModule,
    ]);

    addressRepository = container.resolve(ADDRESS_REPOSITORY);
    userRepository = container.resolve(USER_REPOSITORY);
    customerRepository = container.resolve(CUSTOMER_REPOSITORY);

    authHelper = new AuthHelper(container);

    const app = new App(container);

    server = new Server(app.instance);

    server.listen();
  });

  afterEach(async () => {
    server.close();

    await PostgresHelper.removeDataFromTables();
  });

  describe('Create address', () => {
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

      const customer = await customerRepository.createOne({ userId: user.id });

      const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress } =
        addressTestDataGenerator.generateData();

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

    it('accepts a request and returns created when all required body properties are provided', async () => {
      expect.assertions(1);

      const { email, password, id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const user = await userRepository.createOne({ email, password, role });

      const customer = await customerRepository.createOne({ userId: user.id });

      const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress } =
        addressTestDataGenerator.generateData();

      const response = await request(server.instance).post(baseUrl).set('Authorization', `Bearer ${accessToken}`).send({
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

  describe('Find address', () => {
    it('returns bad request the addressId param is not uuid', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const addressId = 'abc';

      const response = await request(server.instance)
        .get(`${baseUrl}/${addressId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    it('returns not found when address with given addressId does not exist', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const { id } = addressTestDataGenerator.generateData();

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

      const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress } =
        addressTestDataGenerator.generateData();

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

    it(`returns forbidden when user requests other customer's address`, async () => {
      expect.assertions(1);

      const { email, password, id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const user = await userRepository.createOne({ email, password, role });

      const customer = await customerRepository.createOne({ userId: user.id });

      const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress } =
        addressTestDataGenerator.generateData();

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

    it('accepts a request and returns ok when addressId is uuid and have corresponding address', async () => {
      expect.assertions(1);

      const { email, password, role } = userTestDataGenerator.generateData();

      const user = await userRepository.createOne({ email, password, role });

      const accessToken = authHelper.mockAuth({ userId: user.id, role });

      const customer = await customerRepository.createOne({ userId: user.id });

      const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress } =
        addressTestDataGenerator.generateData();

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

  describe('Find addresses', () => {
    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const response = await request(server.instance).get(`${baseUrl}`);

      expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
    });

    it('returns addresses with filtering provided', async () => {
      expect.assertions(2);

      const { email, password, id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const user1 = await userRepository.createOne({ email, password, role });

      const { email: otherEmail } = userTestDataGenerator.generateData();

      const user2 = await userRepository.createOne({ email: otherEmail, password, role });

      const customer1 = await customerRepository.createOne({ userId: user1.id });

      const customer2 = await customerRepository.createOne({ userId: user2.id });

      const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress } =
        addressTestDataGenerator.generateData();

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

  describe('Remove address', () => {
    it('returns bad request when the addressId param is not uuid', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const addressId = 'abc';

      const response = await request(server.instance)
        .delete(`${baseUrl}/${addressId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send();

      expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    it('returns not found when address with given addressId does not exist', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const { id } = addressTestDataGenerator.generateData();

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

      const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress } =
        addressTestDataGenerator.generateData();

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

    it('accepts a request and returns no content when addressId is uuid and corresponds to existing address', async () => {
      expect.assertions(1);

      const { email, password, id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const user = await userRepository.createOne({ email, password, role });

      const customer = await customerRepository.createOne({ userId: user.id });

      const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress } =
        addressTestDataGenerator.generateData();

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
