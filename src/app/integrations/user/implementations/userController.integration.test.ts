import 'reflect-metadata';

import request from 'supertest';
import { DataSource } from 'typeorm';

import { HttpServer } from '../../../../server/httpServer';
import { HttpServerConfigTestFactory } from '../../../../server/tests/factories/httpServerConfigTestFactory/httpServerConfigTestFactory';
import { App } from '../../../app';
import { HttpStatusCode } from '../../../common/http/contracts/httpStatusCode';
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
import { CategoryModule } from '../../../domain/category/categoryModule';
import { CategoryEntity } from '../../../domain/category/contracts/categoryEntity';
import { CustomerEntity } from '../../../domain/customer/contracts/customerEntity';
import { CustomerModule } from '../../../domain/customer/customerModule';
import { UserRepositoryFactory } from '../../../domain/user/contracts/factories/userRepositoryFactory/userRepositoryFactory';
import { HashService } from '../../../domain/user/contracts/services/hashService/hashService';
import { TokenService } from '../../../domain/user/contracts/services/tokenService/tokenService';
import { UserEntity } from '../../../domain/user/contracts/userEntity';
import { UserEntityTestFactory } from '../../../domain/user/tests/factories/userEntityTestFactory/userEntityTestFactory';
import { UserModuleConfigTestFactory } from '../../../domain/user/tests/factories/userModuleConfigTestFactory/userModuleConfigTestFactory';
import { UserModule } from '../../../domain/user/userModule';
import { userSymbols } from '../../../domain/user/userSymbols';
import { DependencyInjectionContainerFactory } from '../../../libs/dependencyInjection/implementations/factories/dependencyInjectionContainerFactory/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../../libs/postgres/postgresModule';
import { postgresSymbols } from '../../../libs/postgres/postgresSymbols';
import { PostgresModuleConfigTestFactory } from '../../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';
import { UnitOfWorkModule } from '../../../libs/unitOfWork/unitOfWorkModule';
import { TestTransactionExternalRunner } from '../../common/tests/unitOfWork/testTransactionExternalRunner';
import { IntegrationsModule } from '../../integrationsModule';

const baseUrl = '/users';
const registerUrl = `${baseUrl}/register`;
const loginUrl = `${baseUrl}/login`;
const setPasswordUrl = `${baseUrl}/set-password`;
const setEmailUrl = `${baseUrl}/set-email`;
const setPhoneNumberUrl = `${baseUrl}/set-phone-number`;

describe(`UserController (${baseUrl})`, () => {
  let hashService: HashService;
  let server: HttpServer;
  let tokenService: TokenService;
  let testTransactionRunner: TestTransactionExternalRunner;
  let userRepositoryFactory: UserRepositoryFactory;
  let dataSource: DataSource;

  const userEntityTestFactory = new UserEntityTestFactory();

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
    ],
  });
  const userModuleConfig = new UserModuleConfigTestFactory().create();
  const httpServerConfig = new HttpServerConfigTestFactory().create();

  const createContainerFunction = DependencyInjectionContainerFactory.create;

  beforeEach(async () => {
    const container = await DependencyInjectionContainerFactory.create({
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
      ],
    });

    DependencyInjectionContainerFactory.create = jest.fn().mockResolvedValue(container);

    userRepositoryFactory = container.get<UserRepositoryFactory>(userSymbols.userRepositoryFactory);
    hashService = container.get<HashService>(userSymbols.hashService);
    dataSource = container.get<DataSource>(postgresSymbols.dataSource);
    tokenService = container.get<TokenService>(userSymbols.tokenService);

    testTransactionRunner = new TestTransactionExternalRunner(container);

    const app = new App({ ...postgresModuleConfig, ...userModuleConfig, ...loggerModuleConfig });

    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }

    server = new HttpServer(app.instance, httpServerConfig);

    await server.listen();
  });

  afterEach(async () => {
    DependencyInjectionContainerFactory.create = createContainerFunction;

    await server.close();

    await dataSource.destroy();
  });

  describe('Register user by email', () => {
    it('returns bad request when not all required properties in body are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { email } = userEntityTestFactory.create();

        const response = await request(server.instance).post(registerUrl).send({
          email,
        });

        expect(response.statusCode).toBe(HttpStatusCode.badRequest);
      });
    });

    it('returns unprocessable entity when user with given email already exists', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const { id, email, password, role } = userEntityTestFactory.create();

        await userRepository.createOne({ id, email: email as string, password, role });

        const response = await request(server.instance).post(registerUrl).send({
          email,
          password,
        });

        expect(response.statusCode).toBe(HttpStatusCode.unprocessableEntity);
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

        expect(response.statusCode).toBe(HttpStatusCode.created);
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

        expect(response.statusCode).toBe(HttpStatusCode.badRequest);
      });
    });

    it('returns unprocessable entity when user with given phone number already exists', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const { id, phoneNumber, password, role } = userEntityTestFactory.create();

        await userRepository.createOne({ id, phoneNumber: phoneNumber as string, password, role });

        const response = await request(server.instance).post(registerUrl).send({
          phoneNumber,
          password,
        });

        expect(response.statusCode).toBe(HttpStatusCode.unprocessableEntity);
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

        expect(response.statusCode).toBe(HttpStatusCode.created);
      });
    });
  });

  describe('Login user by email', () => {
    it('returns bad request when not all required properties in body are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { email } = userEntityTestFactory.create();

        const response = await request(server.instance).post(loginUrl).send({ email });

        expect(response.statusCode).toBe(HttpStatusCode.badRequest);
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

        expect(response.statusCode).toBe(HttpStatusCode.notFound);
      });
    });

    it('returns ok when existing credentials are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const { id, email, password, role } = userEntityTestFactory.create();

        const hashedPassword = await hashService.hash(password);

        await userRepository.createOne({ id, email: email as string, password: hashedPassword, role });

        const response = await request(server.instance).post(loginUrl).send({
          email,
          password,
        });

        expect(response.statusCode).toBe(HttpStatusCode.ok);
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

        expect(response.statusCode).toBe(HttpStatusCode.badRequest);
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

        expect(response.statusCode).toBe(HttpStatusCode.notFound);
      });
    });

    it('returns ok when existing credentials are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const { id, phoneNumber, password, role } = userEntityTestFactory.create();

        const hashedPassword = await hashService.hash(password);

        await userRepository.createOne({ id, phoneNumber: phoneNumber as string, password: hashedPassword, role });

        const response = await request(server.instance).post(loginUrl).send({
          phoneNumber,
          password,
        });

        expect(response.statusCode).toBe(HttpStatusCode.ok);
      });
    });
  });

  describe('Set password', () => {
    it('returns bad request when not all required properties in body are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, password, role } = userEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId, role });

        const response = await request(server.instance)
          .post(setPasswordUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            password,
          });

        expect(response.statusCode).toBe(HttpStatusCode.badRequest);
      });
    });

    it('returns not found when user with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, password, role } = userEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId, role });

        const response = await request(server.instance)
          .post(setPasswordUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            userId,
            password,
          });

        expect(response.statusCode).toBe(HttpStatusCode.notFound);
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

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('returns forbidden when user id from access token does not match target user id', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, password, role } = userEntityTestFactory.create();

        const { id: targetUserId } = userEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId, role });

        const response = await request(server.instance)
          .post(setPasswordUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            userId: targetUserId,
            password,
          });

        expect(response.statusCode).toBe(HttpStatusCode.forbidden);
      });
    });

    it('returns no content when all required fields are provided and user with given id exists', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const { id, email, password, role } = userEntityTestFactory.create();

        const user = await userRepository.createOne({ id, email: email as string, password, role });

        const accessToken = tokenService.createToken({ userId: user.id, role: user.role });

        const response = await request(server.instance)
          .post(setPasswordUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            userId: user.id,
            password,
          });

        expect(response.statusCode).toBe(HttpStatusCode.noContent);
      });
    });
  });

  describe('Set email', () => {
    it('returns bad request when not all required properties in body are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, email, role } = userEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId, role });

        const response = await request(server.instance)
          .post(setEmailUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            email,
          });

        expect(response.statusCode).toBe(HttpStatusCode.badRequest);
      });
    });

    it('returns not found when user with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, email, role } = userEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId, role });

        const response = await request(server.instance)
          .post(setEmailUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            userId,
            email,
          });

        expect(response.statusCode).toBe(HttpStatusCode.notFound);
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

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('returns forbidden when user id from access token does not match target user id', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, email, role } = userEntityTestFactory.create();

        const { id: targetUserId } = userEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId, role });

        const response = await request(server.instance)
          .post(setEmailUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            userId: targetUserId,
            email,
          });

        expect(response.statusCode).toBe(HttpStatusCode.forbidden);
      });
    });

    it('returns unprocessable entity when email is already in use by other user', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const { id: id1, email, password, role } = userEntityTestFactory.create();

        const { id: id2, phoneNumber } = userEntityTestFactory.create();

        await userRepository.createOne({ id: id1, email: email as string, password, role });

        const user = await userRepository.createOne({ id: id2, phoneNumber: phoneNumber as string, password, role });

        const accessToken = tokenService.createToken({ userId: user.id, role: user.role });

        const response = await request(server.instance)
          .post(setEmailUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            userId: user.id,
            email,
          });

        expect(response.statusCode).toBe(HttpStatusCode.unprocessableEntity);
      });
    });

    it('returns unprocessable entity when email is already set for target user', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const { id, email, password, role } = userEntityTestFactory.create();

        const user = await userRepository.createOne({ id, email: email as string, password, role });

        const accessToken = tokenService.createToken({ userId: user.id, role: user.role });

        const response = await request(server.instance)
          .post(setEmailUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            userId: user.id,
            email,
          });

        expect(response.statusCode).toBe(HttpStatusCode.unprocessableEntity);
      });
    });

    it('returns no content when all required fields are provided and user with given id exists', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const { id, phoneNumber, email, password, role } = userEntityTestFactory.create();

        const user = await userRepository.createOne({ id, phoneNumber: phoneNumber as string, password, role });

        const accessToken = tokenService.createToken({ userId: user.id, role: user.role });

        const response = await request(server.instance)
          .post(setEmailUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            userId: user.id,
            email,
          });

        expect(response.statusCode).toBe(HttpStatusCode.noContent);
      });
    });
  });

  describe('Set phone number', () => {
    it('returns bad request when not all required properties in body are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, phoneNumber, role } = userEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId, role });

        const response = await request(server.instance)
          .post(setPhoneNumberUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            phoneNumber,
          });

        expect(response.statusCode).toBe(HttpStatusCode.badRequest);
      });
    });

    it('returns not found when user with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, phoneNumber, role } = userEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId, role });

        const response = await request(server.instance)
          .post(setPhoneNumberUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            userId,
            phoneNumber,
          });

        expect(response.statusCode).toBe(HttpStatusCode.notFound);
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

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('returns forbidden when user id from access token does not match target user id', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, phoneNumber, role } = userEntityTestFactory.create();

        const { id: targetUserId } = userEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId, role });

        const response = await request(server.instance)
          .post(setPhoneNumberUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            userId: targetUserId,
            phoneNumber,
          });

        expect(response.statusCode).toBe(HttpStatusCode.forbidden);
      });
    });

    it('returns unprocessable entity when phone number is already in use by other user', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const { id: id1, phoneNumber, password, role } = userEntityTestFactory.create();

        const { id: id2, email } = userEntityTestFactory.create();

        await userRepository.createOne({ id: id1, role, phoneNumber: phoneNumber as string, password });

        const user = await userRepository.createOne({ id: id2, role, email: email as string, password });

        const accessToken = tokenService.createToken({ userId: user.id, role: user.role });

        const response = await request(server.instance)
          .post(setPhoneNumberUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            userId: user.id,
            phoneNumber,
          });

        expect(response.statusCode).toBe(HttpStatusCode.unprocessableEntity);
      });
    });

    it('returns unprocessable entity when phone number is already set for target user', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const { id, role, phoneNumber, password } = userEntityTestFactory.create();

        const user = await userRepository.createOne({ id, role, phoneNumber: phoneNumber as string, password });

        const accessToken = tokenService.createToken({ userId: user.id, role: user.role });

        const response = await request(server.instance)
          .post(setPhoneNumberUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            userId: user.id,
            phoneNumber,
          });

        expect(response.statusCode).toBe(HttpStatusCode.unprocessableEntity);
      });
    });

    it('returns no content when all required fields are provided and user with given id exists', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const { id, role, phoneNumber, email, password } = userEntityTestFactory.create();

        const user = await userRepository.createOne({ id, role, email: email as string, password });

        const accessToken = tokenService.createToken({ userId: user.id, role: user.role });

        const response = await request(server.instance)
          .post(setPhoneNumberUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            userId: user.id,
            phoneNumber,
          });

        expect(response.statusCode).toBe(HttpStatusCode.noContent);
      });
    });
  });

  describe('Find user', () => {
    it('returns bad request the userId param is not uuid', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const userId = 'abc';

        const { role } = userEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId, role });

        const response = await request(server.instance)
          .get(`${baseUrl}/${userId}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.badRequest);
      });
    });

    it('returns not found when user with given userId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId, role });

        const response = await request(server.instance)
          .get(`${baseUrl}/${userId}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.notFound);
      });
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const { id, role, email, password } = userEntityTestFactory.create();

        const user = await userRepository.createOne({ id, role, email: email as string, password });

        const response = await request(server.instance).get(`${baseUrl}/${user.id}`);

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('returns forbidden when user id from access token does not match target user id', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const { id: targetUserId } = userEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId, role });

        const response = await request(server.instance)
          .get(`${baseUrl}/${targetUserId}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.forbidden);
      });
    });

    it('accepts a request and returns ok when userId is uuid and have corresponding user', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const { id, role, email, password } = userEntityTestFactory.create();

        const user = await userRepository.createOne({ id, role, email: email as string, password });

        const accessToken = tokenService.createToken({ userId: user.id, role: user.role });

        const response = await request(server.instance)
          .get(`${baseUrl}/${user.id}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.ok);
      });
    });
  });

  describe('Delete user', () => {
    it('returns bad request when the userId param is not uuid', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const userId = 'abc';

        const { role } = userEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId, role });

        const response = await request(server.instance)
          .delete(`${baseUrl}/${userId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send();

        expect(response.statusCode).toBe(HttpStatusCode.badRequest);
      });
    });

    it('returns not found when user with given userId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId, role });

        const response = await request(server.instance)
          .delete(`${baseUrl}/${userId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send();

        expect(response.statusCode).toBe(HttpStatusCode.notFound);
      });
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const { id, role, email, password } = userEntityTestFactory.create();

        const user = await userRepository.createOne({ id, role, email: email as string, password });

        const response = await request(server.instance).delete(`${baseUrl}/${user.id}`);

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('returns forbidden when user id from access token does not match target user id', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const { id: targetUserId } = userEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId, role });

        const response = await request(server.instance)
          .delete(`${baseUrl}/${targetUserId}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.forbidden);
      });
    });

    it('accepts a request and returns no content when userId is uuid and corresponds to existing user', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const { id, role, email, password } = userEntityTestFactory.create();

        const user = await userRepository.createOne({ id, role, email: email as string, password });

        const accessToken = tokenService.createToken({ userId: user.id, role: user.role });

        const response = await request(server.instance)
          .delete(`${baseUrl}/${user.id}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.noContent);
      });
    });
  });
});
