import { ConfigLoader } from '../../config';
import { UserTestDataGenerator } from '../../domain/user/testDataGenerators/userTestDataGenerator';
import request from 'supertest';
import { App } from '../../../app';
import { createDIContainer } from '../../shared';
import { DbModule } from '../../shared';
import { UserModule } from '../../domain/user/userModule';
import { ControllersModule } from '../controllersModule';
import { Server } from '../../../server';
import { UserRepository } from '../../domain/user/repositories/userRepository';
import { StatusCodes } from 'http-status-codes';
import { PostgresHelper } from '../../../integration/helpers/postgresHelper/postgresHelper';
import { HashService } from 'src/app/domain/user/services/hashService';

const baseUrl = '/users';
const registerUrl = `${baseUrl}/register`;
const loginUrl = `${baseUrl}/login`;
const setPasswordUrl = `${baseUrl}/set-password`;

describe(`UserController (${baseUrl})`, () => {
  let userRepository: UserRepository;
  let hashService: HashService;
  let userTestDataGenerator: UserTestDataGenerator;
  let server: Server;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([DbModule, UserModule, ControllersModule]);

    userRepository = container.resolve('userRepository');
    hashService = container.resolve('hashService');

    userTestDataGenerator = new UserTestDataGenerator();
  });

  beforeEach(async () => {
    const app = new App();

    server = new Server(app.expressApp);

    server.listen();
  });

  afterEach(async () => {
    server.close();

    await PostgresHelper.removeDataFromTables();
  });

  describe('Register user', () => {
    it('returns bad request when not all required properties in body are provided', async () => {
      expect.assertions(1);

      const { email } = userTestDataGenerator.generateData();

      const response = await request(server.server).post(registerUrl).send({
        email,
      });

      expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    it('returns unprocessable entity when user with given email already exists', async () => {
      expect.assertions(1);

      const { email, password } = userTestDataGenerator.generateData();

      await userRepository.createOne({ email, password });

      const response = await request(server.server).post(registerUrl).send({
        email,
        password,
      });

      expect(response.statusCode).toBe(StatusCodes.UNPROCESSABLE_ENTITY);
    });

    it('returns created when all required body properties are provided', async () => {
      expect.assertions(1);

      const { email, password } = userTestDataGenerator.generateData();

      const response = await request(server.server).post(registerUrl).send({
        email,
        password,
      });

      expect(response.statusCode).toBe(StatusCodes.CREATED);
    });
  });

  describe('Login user', () => {
    it('returns bad request when not all required properties in body are provided', async () => {
      expect.assertions(1);

      const { email } = userTestDataGenerator.generateData();

      const response = await request(server.server).post(loginUrl).send({
        email,
      });

      expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    it('returns not found when user with given email does not exist', async () => {
      expect.assertions(1);

      const { email, password } = userTestDataGenerator.generateData();

      const response = await request(server.server).post(loginUrl).send({
        email,
        password,
      });

      expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
    });

    it('returns ok when existing credentials are provided', async () => {
      expect.assertions(1);

      const { email, password } = userTestDataGenerator.generateData();

      const hashedPassword = await hashService.hash(password);

      await userRepository.createOne({ email, password: hashedPassword });

      const response = await request(server.server).post(loginUrl).send({
        email,
        password,
      });

      expect(response.statusCode).toBe(StatusCodes.OK);
    });
  });

  describe('Set password', () => {
    it('returns bad request when not all required properties in body are provided', async () => {
      expect.assertions(1);

      const { password } = userTestDataGenerator.generateData();

      const response = await request(server.server).post(setPasswordUrl).send({
        password,
      });

      expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    it('returns not found when user with given id does not exist', async () => {
      expect.assertions(1);

      const { id: userId, password } = userTestDataGenerator.generateData();

      const response = await request(server.server).post(setPasswordUrl).send({
        userId,
        password,
      });

      expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
    });

    it('returns no content when all required fields provided and user with given id exists', async () => {
      expect.assertions(1);

      const { email, password } = userTestDataGenerator.generateData();

      const user = await userRepository.createOne({ email, password });

      const response = await request(server.server).post(setPasswordUrl).send({
        userId: user.id,
        password,
      });

      expect(response.statusCode).toBe(StatusCodes.NO_CONTENT);
    });
  });

  describe('Find user', () => {
    it('returns bad request the userId param is not uuid', async () => {
      expect.assertions(1);

      const userId = 'abc';

      const response = await request(server.server).get(`${baseUrl}/${userId}`);

      expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    it('returns not found when user with given userId does not exist', async () => {
      expect.assertions(1);

      const { id } = userTestDataGenerator.generateData();

      const response = await request(server.server).get(`${baseUrl}/${id}`);

      expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
    });

    it('accepts a request and returns ok when userId is uuid and have corresponding user', async () => {
      expect.assertions(1);

      const { email, password } = userTestDataGenerator.generateData();

      const user = await userRepository.createOne({ email, password });

      const response = await request(server.server).get(`${baseUrl}/${user.id}`);

      expect(response.statusCode).toBe(StatusCodes.OK);
    });
  });

  describe('Remove user', () => {
    it('returns bad request when the userId param is not uuid', async () => {
      expect.assertions(1);

      const userId = 'abc';

      const response = await request(server.server).delete(`${baseUrl}/${userId}`).send();

      expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    it('returns not found when user with given userId does not exist', async () => {
      expect.assertions(1);

      const { id } = userTestDataGenerator.generateData();

      const response = await request(server.server).delete(`${baseUrl}/${id}`).send();

      expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
    });

    it('accepts a request and returns no content when userId is uuid and corresponds to existing user', async () => {
      expect.assertions(1);

      const { email, password } = userTestDataGenerator.generateData();

      const user = await userRepository.createOne({ email, password });

      const response = await request(server.server).delete(`${baseUrl}/${user.id}`);

      expect(response.statusCode).toBe(StatusCodes.NO_CONTENT);
    });
  });
});
