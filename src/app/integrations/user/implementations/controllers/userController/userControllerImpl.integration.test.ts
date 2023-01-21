import { ConfigLoader } from '../../../../../../configLoader';
import { UserEntityTestFactory } from '../../../../../domain/user/tests/factories/userEntityTestFactory/userEntityTestFactory';
import request from 'supertest';
import { App } from '../../../../../../app';
import { UserModule } from '../../../../../domain/user/userModule';
import { IntegrationsModule } from '../../../../integrationsModule';
import { Server } from '../../../../../../server';
import { StatusCodes } from 'http-status-codes';
import { BookModule } from '../../../../../domain/book/bookModule';
import { AuthorModule } from '../../../../../domain/author/authorModule';
import { CategoryModule } from '../../../../../domain/category/categoryModule';
import { AuthorBookModule } from '../../../../../domain/authorBook/authorBookModule';
import { BookCategoryModule } from '../../../../../domain/bookCategory/bookCategoryModule';
import { AddressModule } from '../../../../../domain/address/addressModule';
import { CustomerModule } from '../../../../../domain/customer/customerModule';
import { UserRepositoryFactory } from '../../../../../domain/user/contracts/factories/userRepositoryFactory/userRepositoryFactory';
import { HashService } from '../../../../../domain/user/contracts/services/hashService/hashService';
import { createDependencyInjectionContainer } from '../../../../../libs/dependencyInjection/container';
import { LoggerModule } from '../../../../../libs/logger/loggerModule';
import { postgresConnector } from '../../../../../libs/postgres/postgresConnector';
import { PostgresModule } from '../../../../../libs/postgres/postgresModule';
import { UnitOfWorkModule } from '../../../../../libs/unitOfWork/unitOfWorkModule';
import { AuthHelper, TestTransactionExternalRunner } from '../../../../../tests/helpers';

const baseUrl = '/users';
const registerUrl = `${baseUrl}/register`;
const loginUrl = `${baseUrl}/login`;
const setPasswordUrl = `${baseUrl}/set-password`;
const setEmailUrl = `${baseUrl}/set-email`;
const setPhoneNumberUrl = `${baseUrl}/set-phone-number`;

describe(`UserControllerImpl (${baseUrl})`, () => {
  let hashService: HashService;
  let userEntityTestFactory: UserEntityTestFactory;
  let server: Server;
  let authHelper: AuthHelper;
  let testTransactionRunner: TestTransactionExternalRunner;
  let userRepositoryFactory: UserRepositoryFactory;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    userEntityTestFactory = new UserEntityTestFactory();
  });

  beforeEach(async () => {
    const container = await createDependencyInjectionContainer([
      PostgresModule,
      CategoryModule,
      BookModule,
      AuthorModule,
      UserModule,
      IntegrationsModule,
      AuthorBookModule,
      LoggerModule,
      BookCategoryModule,
      AddressModule,
      CustomerModule,
      UnitOfWorkModule,
    ]);

    userRepositoryFactory = container.resolve(USER_REPOSITORY_FACTORY);

    testTransactionRunner = new TestTransactionExternalRunner(container);

    hashService = container.resolve(HASH_SERVICE);

    authHelper = new AuthHelper(container);

    const app = new App(container);

    server = new Server(app.instance);

    server.listen();
  });

  afterEach(async () => {
    server.close();

    postgresConnector.closeConnection();
  });

  describe('Register user by email', () => {
    it('returns bad request when not all required properties in body are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { email } = userEntityTestFactory.create();

        const response = await request(server.instance).post(registerUrl).send({
          email,
        });

        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
      });
    });

    it('returns unprocessable entity when user with given email already exists', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const userRepository = userRepositoryFactory.create(entityManager);

        const { email, password } = userEntityTestFactory.create();

        await userRepository.createOne({ email, password });

        const response = await request(server.instance).post(registerUrl).send({
          email,
          password,
        });

        expect(response.statusCode).toBe(StatusCodes.UNPROCESSABLE_ENTITY);
      });
    });

    it('returns created when all required body properties are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
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

      await testTransactionRunner.runInTestTransaction(async () => {
        const { phoneNumber } = userEntityTestFactory.create();

        const response = await request(server.instance).post(registerUrl).send({
          phoneNumber,
        });

        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
      });
    });

    it('returns unprocessable entity when user with given phone number already exists', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const userRepository = userRepositoryFactory.create(entityManager);

        const { phoneNumber, password } = userEntityTestFactory.create();

        await userRepository.createOne({ phoneNumber, password });

        const response = await request(server.instance).post(registerUrl).send({
          phoneNumber,
          password,
        });

        expect(response.statusCode).toBe(StatusCodes.UNPROCESSABLE_ENTITY);
      });
    });

    it('returns created when all required body properties are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
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

      await testTransactionRunner.runInTestTransaction(async () => {
        const { email } = userEntityTestFactory.create();

        const response = await request(server.instance).post(loginUrl).send({
          email,
        });

        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
      });
    });

    it('returns not found when user with given email does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
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

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const userRepository = userRepositoryFactory.create(entityManager);

        const { email, password } = userEntityTestFactory.create();

        const hashedPassword = await hashService.hash(password);

        await userRepository.createOne({ email, password: hashedPassword });

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

      await testTransactionRunner.runInTestTransaction(async () => {
        const { phoneNumber } = userEntityTestFactory.create();

        const response = await request(server.instance).post(loginUrl).send({
          phoneNumber,
        });

        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
      });
    });

    it('returns not found when user with given phone number does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
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

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const userRepository = userRepositoryFactory.create(entityManager);

        const { phoneNumber, password } = userEntityTestFactory.create();

        const hashedPassword = await hashService.hash(password);

        await userRepository.createOne({ phoneNumber, password: hashedPassword });

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

      await testTransactionRunner.runInTestTransaction(async () => {
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

      await testTransactionRunner.runInTestTransaction(async () => {
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

      await testTransactionRunner.runInTestTransaction(async () => {
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

      await testTransactionRunner.runInTestTransaction(async () => {
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

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const userRepository = userRepositoryFactory.create(entityManager);

        const { email, password } = userEntityTestFactory.create();

        const user = await userRepository.createOne({ email, password });

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

      await testTransactionRunner.runInTestTransaction(async () => {
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

      await testTransactionRunner.runInTestTransaction(async () => {
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

      await testTransactionRunner.runInTestTransaction(async () => {
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

      await testTransactionRunner.runInTestTransaction(async () => {
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

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const userRepository = userRepositoryFactory.create(entityManager);

        const { phoneNumber, email, password } = userEntityTestFactory.create();

        await userRepository.createOne({ email, password });

        const user = await userRepository.createOne({ phoneNumber, password });

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

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const userRepository = userRepositoryFactory.create(entityManager);

        const { email, password } = userEntityTestFactory.create();

        const user = await userRepository.createOne({ email, password });

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

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const userRepository = userRepositoryFactory.create(entityManager);

        const { phoneNumber, email, password } = userEntityTestFactory.create();

        const user = await userRepository.createOne({ phoneNumber, password });

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

      await testTransactionRunner.runInTestTransaction(async () => {
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

      await testTransactionRunner.runInTestTransaction(async () => {
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

      await testTransactionRunner.runInTestTransaction(async () => {
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

      await testTransactionRunner.runInTestTransaction(async () => {
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

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const userRepository = userRepositoryFactory.create(entityManager);

        const { phoneNumber, email, password } = userEntityTestFactory.create();

        await userRepository.createOne({ phoneNumber, password });

        const user = await userRepository.createOne({ email, password });

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

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const userRepository = userRepositoryFactory.create(entityManager);

        const { phoneNumber, password } = userEntityTestFactory.create();

        const user = await userRepository.createOne({ phoneNumber, password });

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

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const userRepository = userRepositoryFactory.create(entityManager);

        const { phoneNumber, email, password } = userEntityTestFactory.create();

        const user = await userRepository.createOne({ email, password });

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

      await testTransactionRunner.runInTestTransaction(async () => {
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

      await testTransactionRunner.runInTestTransaction(async () => {
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

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const userRepository = userRepositoryFactory.create(entityManager);

        const { email, password } = userEntityTestFactory.create();

        const user = await userRepository.createOne({ email, password });

        const response = await request(server.instance).get(`${baseUrl}/${user.id}`);

        expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      });
    });

    it('returns forbidden when user id from access token does not match target user id', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
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

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const userRepository = userRepositoryFactory.create(entityManager);

        const { email, password } = userEntityTestFactory.create();

        const user = await userRepository.createOne({ email, password });

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

      await testTransactionRunner.runInTestTransaction(async () => {
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

      await testTransactionRunner.runInTestTransaction(async () => {
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

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const userRepository = userRepositoryFactory.create(entityManager);

        const { email, password } = userEntityTestFactory.create();

        const user = await userRepository.createOne({ email, password });

        const response = await request(server.instance).delete(`${baseUrl}/${user.id}`);

        expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      });
    });

    it('returns forbidden when user id from access token does not match target user id', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
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

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const userRepository = userRepositoryFactory.create(entityManager);

        const { email, password } = userEntityTestFactory.create();

        const user = await userRepository.createOne({ email, password });

        const accessToken = authHelper.mockAuth({ userId: user.id, role: user.role });

        const response = await request(server.instance)
          .delete(`${baseUrl}/${user.id}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(StatusCodes.NO_CONTENT);
      });
    });
  });
});
