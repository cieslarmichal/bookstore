import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';

import { HttpServer } from '../../../../../../server/httpServer';
import { HttpServerConfigTestFactory } from '../../../../../../server/tests/factories/httpServerConfigTestFactory/httpServerConfigTestFactory';
import { App } from '../../../../../app';
import { AddressModule } from '../../../../../domain/address/addressModule';
import { AuthorModule } from '../../../../../domain/author/authorModule';
import { AuthorBookModule } from '../../../../../domain/authorBook/authorBookModule';
import { BookModule } from '../../../../../domain/book/bookModule';
import { BookCategoryModule } from '../../../../../domain/bookCategory/bookCategoryModule';
import { CategoryModule } from '../../../../../domain/category/categoryModule';
import { CustomerModule } from '../../../../../domain/customer/customerModule';
import { UserRepositoryFactory } from '../../../../../domain/user/contracts/factories/userRepositoryFactory/userRepositoryFactory';
import { HashService } from '../../../../../domain/user/contracts/services/hashService/hashService';
import { UserEntityTestFactory } from '../../../../../domain/user/tests/factories/userEntityTestFactory/userEntityTestFactory';
import { UserModuleConfigTestFactory } from '../../../../../domain/user/tests/factories/userModuleConfigTestFactory/userModuleConfigTestFactory';
import { UserModule } from '../../../../../domain/user/userModule';
import { userSymbols } from '../../../../../domain/user/userSymbols';
import { createDependencyInjectionContainer } from '../../../../../libs/dependencyInjection/container';
import { LoggerModule } from '../../../../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../../../../libs/logger/loggerModuleConfigTestFactory';
import { PostgresConnector } from '../../../../../libs/postgres/postgresConnector';
import { PostgresModule } from '../../../../../libs/postgres/postgresModule';
import { PostgresModuleConfigTestFactory } from '../../../../../libs/postgres/postgresModuleConfigTestFactory';
import { postgresSymbols } from '../../../../../libs/postgres/postgresSymbols';
import { UnitOfWorkModule } from '../../../../../libs/unitOfWork/unitOfWorkModule';
import { AuthHelper } from '../../../../../tests/auth/authHelper';
import { SpyFactory } from '../../../../../tests/factories/spyFactory';
import { TestTransactionExternalRunner } from '../../../../../tests/unitOfWork/testTransactionExternalRunner';
import { IntegrationsModule } from '../../../../integrationsModule';

const baseUrl = '/users';
const registerUrl = `${baseUrl}/register`;
const loginUrl = `${baseUrl}/login`;
const setPasswordUrl = `${baseUrl}/set-password`;
const setEmailUrl = `${baseUrl}/set-email`;
const setPhoneNumberUrl = `${baseUrl}/set-phone-number`;

describe(`UserControllerImpl (${baseUrl})`, () => {
  const spyFactory = new SpyFactory(vi);

  let hashService: HashService;
  let server: HttpServer;
  let authHelper: AuthHelper;
  let testTransactionRunner: TestTransactionExternalRunner;
  let userRepositoryFactory: UserRepositoryFactory;
  let postgresConnector: PostgresConnector;

  const userEntityTestFactory = new UserEntityTestFactory();

  const loggerModuleConfig = new LoggerModuleConfigTestFactory().create();
  const postgresModuleConfig = new PostgresModuleConfigTestFactory().create();
  const userModuleConfig = new UserModuleConfigTestFactory().create();
  const httpServerConfig = new HttpServerConfigTestFactory().create();

  beforeEach(async () => {
    const container = await createDependencyInjectionContainer([
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
    ]);

    userRepositoryFactory = container.resolve(userSymbols.userRepositoryFactory);
    postgresConnector = container.resolve(postgresSymbols.postgresConnector);

    testTransactionRunner = new TestTransactionExternalRunner(container);

    hashService = container.resolve(userSymbols.hashService);

    authHelper = new AuthHelper(spyFactory, container);

    const app = new App({ ...postgresModuleConfig, ...userModuleConfig, ...loggerModuleConfig });

    server = new HttpServer(app.instance, httpServerConfig);

    server.listen();
  });

  afterEach(async () => {
    server.close();

    postgresConnector.closeConnection();
  });

  describe('Register user by email', () => {
    it('returns bad request when not all required properties in body are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async () => {
        const { email } = userEntityTestFactory.create();

        const response = await request(server.instance).post(registerUrl).send({
          email,
        });

        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
      });
    });

    it('returns unprocessable entity when user with given email already exists', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const userRepository = userRepositoryFactory.create(entityManager);

        const { email, password } = userEntityTestFactory.create();

        await userRepository.createOne({ email: email as string, password });

        const response = await request(server.instance).post(registerUrl).send({
          email,
          password,
        });

        expect(response.statusCode).toBe(StatusCodes.UNPROCESSABLE_ENTITY);
      });
    });

    it('returns created when all required body properties are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async () => {
        const { email, password } = userEntityTestFactory.create();

        const response = await request(server.instance).post(registerUrl).send({
          email,
          password,
        });

        expect(response.statusCode).toBe(StatusCodes.CREATED);
      });
    });
  });

  describe('Register user by phone number', () => {
    it('returns bad request when not all required properties in body are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async () => {
        const { phoneNumber } = userEntityTestFactory.create();

        const response = await request(server.instance).post(registerUrl).send({
          phoneNumber,
        });

        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
      });
    });

    it('returns unprocessable entity when user with given phone number already exists', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const userRepository = userRepositoryFactory.create(entityManager);

        const { phoneNumber, password } = userEntityTestFactory.create();

        await userRepository.createOne({ phoneNumber: phoneNumber as string, password });

        const response = await request(server.instance).post(registerUrl).send({
          phoneNumber,
          password,
        });

        expect(response.statusCode).toBe(StatusCodes.UNPROCESSABLE_ENTITY);
      });
    });

    it('returns created when all required body properties are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async () => {
        const { phoneNumber, password } = userEntityTestFactory.create();

        const response = await request(server.instance).post(registerUrl).send({
          phoneNumber,
          password,
        });

        expect(response.statusCode).toBe(StatusCodes.CREATED);
      });
    });
  });

  describe('Login user by email', () => {
    it('returns bad request when not all required properties in body are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async () => {
        const { email } = userEntityTestFactory.create();

        const response = await request(server.instance).post(loginUrl).send({
          email,
        });

        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
      });
    });

    it('returns not found when user with given email does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async () => {
        const { email, password } = userEntityTestFactory.create();

        const response = await request(server.instance).post(loginUrl).send({
          email,
          password,
        });

        expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
      });
    });

    it('returns ok when existing credentials are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const userRepository = userRepositoryFactory.create(entityManager);

        const { email, password } = userEntityTestFactory.create();

        const hashedPassword = await hashService.hash(password);

        await userRepository.createOne({ email: email as string, password: hashedPassword });

        const response = await request(server.instance).post(loginUrl).send({
          email,
          password,
        });

        expect(response.statusCode).toBe(StatusCodes.OK);
      });
    });
  });

  describe('Login user by phone number', () => {
    it('returns bad request when not all required properties in body are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async () => {
        const { phoneNumber } = userEntityTestFactory.create();

        const response = await request(server.instance).post(loginUrl).send({
          phoneNumber,
        });

        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
      });
    });

    it('returns not found when user with given phone number does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async () => {
        const { phoneNumber, password } = userEntityTestFactory.create();

        const response = await request(server.instance).post(loginUrl).send({
          phoneNumber,
          password,
        });

        expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
      });
    });

    it('returns ok when existing credentials are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const userRepository = userRepositoryFactory.create(entityManager);

        const { phoneNumber, password } = userEntityTestFactory.create();

        const hashedPassword = await hashService.hash(password);

        await userRepository.createOne({ phoneNumber: phoneNumber as string, password: hashedPassword });

        const response = await request(server.instance).post(loginUrl).send({
          phoneNumber,
          password,
        });

        expect(response.statusCode).toBe(StatusCodes.OK);
      });
    });
  });

  describe('Set password', () => {
    it('returns bad request when not all required properties in body are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async () => {
        const { id: userId, password, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const response = await request(server.instance)
          .post(setPasswordUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            password,
          });

        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
      });
    });

    it('returns not found when user with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async () => {
        const { id: userId, password, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const response = await request(server.instance)
          .post(setPasswordUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            userId,
            password,
          });

        expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
      });
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async () => {
        const { id: userId, password } = userEntityTestFactory.create();

        const response = await request(server.instance).post(setPasswordUrl).send({
          userId,
          password,
        });

        expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      });
    });

    it('returns forbidden when user id from access token does not match target user id', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async () => {
        const { id: userId, password, role } = userEntityTestFactory.create();

        const { id: targetUserId } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const response = await request(server.instance)
          .post(setPasswordUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            userId: targetUserId,
            password,
          });

        expect(response.statusCode).toBe(StatusCodes.FORBIDDEN);
      });
    });

    it('returns no content when all required fields are provided and user with given id exists', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const userRepository = userRepositoryFactory.create(entityManager);

        const { email, password } = userEntityTestFactory.create();

        const user = await userRepository.createOne({ email: email as string, password });

        const accessToken = authHelper.mockAuth({ userId: user.id, role: user.role });

        const response = await request(server.instance)
          .post(setPasswordUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            userId: user.id,
            password,
          });

        expect(response.statusCode).toBe(StatusCodes.NO_CONTENT);
      });
    });
  });

  describe('Set email', () => {
    it('returns bad request when not all required properties in body are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async () => {
        const { id: userId, email, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const response = await request(server.instance)
          .post(setEmailUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            email,
          });

        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
      });
    });

    it('returns not found when user with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async () => {
        const { id: userId, email, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const response = await request(server.instance)
          .post(setEmailUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            userId,
            email,
          });

        expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
      });
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async () => {
        const { id: userId, email } = userEntityTestFactory.create();

        const response = await request(server.instance).post(setEmailUrl).send({
          userId,
          email,
        });

        expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      });
    });

    it('returns forbidden when user id from access token does not match target user id', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async () => {
        const { id: userId, email, role } = userEntityTestFactory.create();

        const { id: targetUserId } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const response = await request(server.instance)
          .post(setEmailUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            userId: targetUserId,
            email,
          });

        expect(response.statusCode).toBe(StatusCodes.FORBIDDEN);
      });
    });

    it('returns unprocessable entity when email is already in use by other user', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const userRepository = userRepositoryFactory.create(entityManager);

        const { phoneNumber, email, password } = userEntityTestFactory.create();

        await userRepository.createOne({ email: email as string, password });

        const user = await userRepository.createOne({ phoneNumber: phoneNumber as string, password });

        const accessToken = authHelper.mockAuth({ userId: user.id, role: user.role });

        const response = await request(server.instance)
          .post(setEmailUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            userId: user.id,
            email,
          });

        expect(response.statusCode).toBe(StatusCodes.UNPROCESSABLE_ENTITY);
      });
    });

    it('returns unprocessable entity when email is already set for target user', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const userRepository = userRepositoryFactory.create(entityManager);

        const { email, password } = userEntityTestFactory.create();

        const user = await userRepository.createOne({ email: email as string, password });

        const accessToken = authHelper.mockAuth({ userId: user.id, role: user.role });

        const response = await request(server.instance)
          .post(setEmailUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            userId: user.id,
            email,
          });

        expect(response.statusCode).toBe(StatusCodes.UNPROCESSABLE_ENTITY);
      });
    });

    it('returns no content when all required fields are provided and user with given id exists', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const userRepository = userRepositoryFactory.create(entityManager);

        const { phoneNumber, email, password } = userEntityTestFactory.create();

        const user = await userRepository.createOne({ phoneNumber: phoneNumber as string, password });

        const accessToken = authHelper.mockAuth({ userId: user.id, role: user.role });

        const response = await request(server.instance)
          .post(setEmailUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            userId: user.id,
            email,
          });

        expect(response.statusCode).toBe(StatusCodes.NO_CONTENT);
      });
    });
  });

  describe('Set phone number', () => {
    it('returns bad request when not all required properties in body are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async () => {
        const { id: userId, phoneNumber, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const response = await request(server.instance)
          .post(setPhoneNumberUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            phoneNumber,
          });

        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
      });
    });

    it('returns not found when user with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async () => {
        const { id: userId, phoneNumber, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const response = await request(server.instance)
          .post(setPhoneNumberUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            userId,
            phoneNumber,
          });

        expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
      });
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async () => {
        const { id: userId, phoneNumber } = userEntityTestFactory.create();

        const response = await request(server.instance).post(setPhoneNumberUrl).send({
          userId,
          phoneNumber,
        });

        expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      });
    });

    it('returns forbidden when user id from access token does not match target user id', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async () => {
        const { id: userId, phoneNumber, role } = userEntityTestFactory.create();

        const { id: targetUserId } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const response = await request(server.instance)
          .post(setPhoneNumberUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            userId: targetUserId,
            phoneNumber,
          });

        expect(response.statusCode).toBe(StatusCodes.FORBIDDEN);
      });
    });

    it('returns unprocessable entity when phone number is already in use by other user', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const userRepository = userRepositoryFactory.create(entityManager);

        const { phoneNumber, email, password } = userEntityTestFactory.create();

        await userRepository.createOne({ phoneNumber: phoneNumber as string, password });

        const user = await userRepository.createOne({ email: email as string, password });

        const accessToken = authHelper.mockAuth({ userId: user.id, role: user.role });

        const response = await request(server.instance)
          .post(setPhoneNumberUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            userId: user.id,
            phoneNumber,
          });

        expect(response.statusCode).toBe(StatusCodes.UNPROCESSABLE_ENTITY);
      });
    });

    it('returns unprocessable entity when phone number is already set for target user', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const userRepository = userRepositoryFactory.create(entityManager);

        const { phoneNumber, password } = userEntityTestFactory.create();

        const user = await userRepository.createOne({ phoneNumber: phoneNumber as string, password });

        const accessToken = authHelper.mockAuth({ userId: user.id, role: user.role });

        const response = await request(server.instance)
          .post(setPhoneNumberUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            userId: user.id,
            phoneNumber,
          });

        expect(response.statusCode).toBe(StatusCodes.UNPROCESSABLE_ENTITY);
      });
    });

    it('returns no content when all required fields are provided and user with given id exists', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const userRepository = userRepositoryFactory.create(entityManager);

        const { phoneNumber, email, password } = userEntityTestFactory.create();

        const user = await userRepository.createOne({ email: email as string, password });

        const accessToken = authHelper.mockAuth({ userId: user.id, role: user.role });

        const response = await request(server.instance)
          .post(setPhoneNumberUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            userId: user.id,
            phoneNumber,
          });

        expect(response.statusCode).toBe(StatusCodes.NO_CONTENT);
      });
    });
  });

  describe('Find user', () => {
    it('returns bad request the userId param is not uuid', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async () => {
        const userId = 'abc';

        const { role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const response = await request(server.instance)
          .get(`${baseUrl}/${userId}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
      });
    });

    it('returns not found when user with given userId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const response = await request(server.instance)
          .get(`${baseUrl}/${userId}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
      });
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const userRepository = userRepositoryFactory.create(entityManager);

        const { email, password } = userEntityTestFactory.create();

        const user = await userRepository.createOne({ email: email as string, password });

        const response = await request(server.instance).get(`${baseUrl}/${user.id}`);

        expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      });
    });

    it('returns forbidden when user id from access token does not match target user id', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const { id: targetUserId } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const response = await request(server.instance)
          .get(`${baseUrl}/${targetUserId}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(StatusCodes.FORBIDDEN);
      });
    });

    it('accepts a request and returns ok when userId is uuid and have corresponding user', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const userRepository = userRepositoryFactory.create(entityManager);

        const { email, password } = userEntityTestFactory.create();

        const user = await userRepository.createOne({ email: email as string, password });

        const accessToken = authHelper.mockAuth({ userId: user.id, role: user.role });

        const response = await request(server.instance)
          .get(`${baseUrl}/${user.id}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(StatusCodes.OK);
      });
    });
  });

  describe('Remove user', () => {
    it('returns bad request when the userId param is not uuid', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async () => {
        const userId = 'abc';

        const { role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const response = await request(server.instance)
          .delete(`${baseUrl}/${userId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send();

        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
      });
    });

    it('returns not found when user with given userId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const response = await request(server.instance)
          .delete(`${baseUrl}/${userId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send();

        expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
      });
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const userRepository = userRepositoryFactory.create(entityManager);

        const { email, password } = userEntityTestFactory.create();

        const user = await userRepository.createOne({ email: email as string, password });

        const response = await request(server.instance).delete(`${baseUrl}/${user.id}`);

        expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      });
    });

    it('returns forbidden when user id from access token does not match target user id', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const { id: targetUserId } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const response = await request(server.instance)
          .delete(`${baseUrl}/${targetUserId}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(StatusCodes.FORBIDDEN);
      });
    });

    it('accepts a request and returns no content when userId is uuid and corresponds to existing user', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const userRepository = userRepositoryFactory.create(entityManager);

        const { email, password } = userEntityTestFactory.create();

        const user = await userRepository.createOne({ email: email as string, password });

        const accessToken = authHelper.mockAuth({ userId: user.id, role: user.role });

        const response = await request(server.instance)
          .delete(`${baseUrl}/${user.id}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(StatusCodes.NO_CONTENT);
      });
    });
  });
});
