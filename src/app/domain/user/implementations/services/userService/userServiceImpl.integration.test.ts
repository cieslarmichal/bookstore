import 'reflect-metadata';

import { describe, it, beforeAll, afterAll, expect, vi } from 'vitest';

import { createDependencyInjectionContainer } from '../../../../../libs/dependencyInjection/container';
import { LoggerModule } from '../../../../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../../../../libs/logger/loggerModuleConfigTestFactory';
import { PostgresConnector } from '../../../../../libs/postgres/postgresConnector';
import { PostgresModule } from '../../../../../libs/postgres/postgresModule';
import { PostgresModuleConfigTestFactory } from '../../../../../libs/postgres/postgresModuleConfigTestFactory';
import { postgresSymbols } from '../../../../../libs/postgres/postgresSymbols';
import { UnitOfWorkModule } from '../../../../../libs/unitOfWork/unitOfWorkModule';
import { SpyFactory } from '../../../../../tests/factories/spyFactory';
import { TestTransactionInternalRunner } from '../../../../../tests/unitOfWork/testTransactionInternalRunner';
import { UserRepositoryFactory } from '../../../contracts/factories/userRepositoryFactory/userRepositoryFactory';
import { HashService } from '../../../contracts/services/hashService/hashService';
import { TokenService } from '../../../contracts/services/tokenService/tokenService';
import { UserService } from '../../../contracts/services/userService/userService';
import { User } from '../../../contracts/user';
import { UserRole } from '../../../contracts/userRole';
import { EmailAlreadySetError } from '../../../errors/emailAlreadySetError';
import { PhoneNumberAlreadySetError } from '../../../errors/phoneNumberAlreadySetError';
import { UserAlreadyExistsError } from '../../../errors/userAlreadyExistsError';
import { UserNotFoundError } from '../../../errors/userNotFoundError';
import { UserEntityTestFactory } from '../../../tests/factories/userEntityTestFactory/userEntityTestFactory';
import { UserModuleConfigTestFactory } from '../../../tests/factories/userModuleConfigTestFactory/userModuleConfigTestFactory';
import { UserModule } from '../../../userModule';
import { userSymbols } from '../../../userSymbols';

describe('UserServiceImpl', () => {
  const spyFactory = new SpyFactory(vi);

  let userService: UserService;
  let userRepositoryFactory: UserRepositoryFactory;
  let tokenService: TokenService;
  let hashService: HashService;
  let testTransactionRunner: TestTransactionInternalRunner;
  let postgresConnector: PostgresConnector;

  const userEntityTestFactory = new UserEntityTestFactory();

  const loggerModuleConfig = new LoggerModuleConfigTestFactory().create();
  const postgresModuleConfig = new PostgresModuleConfigTestFactory().create();
  const userModuleConfig = new UserModuleConfigTestFactory().create();

  beforeAll(async () => {
    const container = await createDependencyInjectionContainer([
      new PostgresModule(postgresModuleConfig),
      new UserModule(userModuleConfig),
      new LoggerModule(loggerModuleConfig),
      new UnitOfWorkModule(),
    ]);

    userService = container.resolve(userSymbols.userService);
    userRepositoryFactory = container.resolve(userSymbols.userRepositoryFactory);
    tokenService = container.resolve(userSymbols.tokenService);
    hashService = container.resolve(userSymbols.hashService);
    postgresConnector = container.resolve(postgresSymbols.postgresConnector);

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    postgresConnector.closeConnection();
  });

  describe('Register user by email', () => {
    it('creates user in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const userRepository = userRepositoryFactory.create(entityManager);

        const { email, password } = userEntityTestFactory.create();

        const createdUserDto = await userService.registerUserByEmail(unitOfWork, {
          email: email as string,
          password,
        });

        const userDto = await userRepository.findOneById(createdUserDto.id);

        expect(userDto).not.toBeNull();
      });
    });

    it('should not create user and throw if user with the same email already exists', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const userRepository = userRepositoryFactory.create(entityManager);

        const { email, password } = userEntityTestFactory.create();

        await userRepository.createOne({
          email: email as string,
          password,
        });

        try {
          await userService.registerUserByEmail(unitOfWork, {
            email: email as string,
            password,
          });
        } catch (error) {
          expect(error).toBeInstanceOf(UserAlreadyExistsError);
        }
      });
    });
  });

  describe('Register user by phone number', () => {
    it('creates user in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const userRepository = userRepositoryFactory.create(entityManager);

        const { phoneNumber, password } = userEntityTestFactory.create();

        const createdUserDto = await userService.registerUserByPhoneNumber(unitOfWork, {
          phoneNumber: phoneNumber as string,
          password,
        });

        const userDto = await userRepository.findOneById(createdUserDto.id);

        expect(userDto).not.toBeNull();
      });
    });

    it('should not create user and throw if user with the same phone number already exists', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const userRepository = userRepositoryFactory.create(entityManager);

        const { phoneNumber, password } = userEntityTestFactory.create();

        await userRepository.createOne({
          phoneNumber: phoneNumber as string,
          password,
        });

        try {
          await userService.registerUserByPhoneNumber(unitOfWork, {
            phoneNumber: phoneNumber as string,
            password,
          });
        } catch (error) {
          expect(error).toBeInstanceOf(UserAlreadyExistsError);
        }
      });
    });
  });

  describe('Login user by email', () => {
    it('should return access token', async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const userRepository = userRepositoryFactory.create(entityManager);

        const { email, password } = userEntityTestFactory.create();

        const hashedPassword = await hashService.hash(password);

        const user = await userRepository.createOne({
          email: email as string,
          password: hashedPassword,
        });

        const accessToken = await userService.loginUserByEmail(unitOfWork, {
          email: email as string,
          password,
        });

        const data = await tokenService.verifyToken(accessToken);

        expect(data['id']).toBe(user.id);
        expect(data['role']).toBe(UserRole.user);
      });
    });

    it('should throw if user with given email does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { email, password } = userEntityTestFactory.create();

        try {
          await userService.loginUserByEmail(unitOfWork, {
            email: email as string,
            password,
          });
        } catch (error) {
          expect(error).toBeInstanceOf(UserNotFoundError);
        }
      });
    });

    it('should throw if user password does not match db password', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const userRepository = userRepositoryFactory.create(entityManager);

        const { email, password } = userEntityTestFactory.create();

        const { password: otherPassword } = userEntityTestFactory.create();

        await userRepository.createOne({
          email: email as string,
          password,
        });

        try {
          await userService.loginUserByEmail(unitOfWork, {
            email: email as string,
            password: otherPassword,
          });
        } catch (error) {
          expect(error).toBeInstanceOf(UserNotFoundError);
        }
      });
    });
  });

  describe('Login user by phone number', () => {
    it('should return access token', async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const userRepository = userRepositoryFactory.create(entityManager);

        const { phoneNumber, password } = userEntityTestFactory.create();

        const hashedPassword = await hashService.hash(password);

        const user = await userRepository.createOne({
          phoneNumber: phoneNumber as string,
          password: hashedPassword,
        });

        const accessToken = await userService.loginUserByPhoneNumber(unitOfWork, {
          phoneNumber: phoneNumber as string,
          password,
        });

        const data = await tokenService.verifyToken(accessToken);

        expect(data['id']).toBe(user.id);
        expect(data['role']).toBe(UserRole.user);
      });
    });

    it('should throw if user with given email does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { phoneNumber, password } = userEntityTestFactory.create();

        try {
          await userService.loginUserByPhoneNumber(unitOfWork, {
            phoneNumber: phoneNumber as string,
            password,
          });
        } catch (error) {
          expect(error).toBeInstanceOf(UserNotFoundError);
        }
      });
    });

    it('should throw if user password does not match db password', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const userRepository = userRepositoryFactory.create(entityManager);

        const { phoneNumber, password } = userEntityTestFactory.create();

        const { password: otherPassword } = userEntityTestFactory.create();

        await userRepository.createOne({
          phoneNumber: phoneNumber as string,
          password,
        });

        try {
          await userService.loginUserByPhoneNumber(unitOfWork, {
            phoneNumber: phoneNumber as string,
            password: otherPassword,
          });
        } catch (error) {
          expect(error).toBeInstanceOf(UserNotFoundError);
        }
      });
    });
  });

  describe('Set password', () => {
    it(`should update user's password in db`, async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const userRepository = userRepositoryFactory.create(entityManager);

        const { email, password } = userEntityTestFactory.create();

        const hashedPassword = await hashService.hash(password);

        const user = await userRepository.createOne({
          email: email as string,
          password: hashedPassword,
        });

        const { password: newPassword } = userEntityTestFactory.create();

        await userService.setPassword(unitOfWork, user.id, newPassword);

        const updatedUser = (await userRepository.findOneById(user.id)) as User;

        expect(updatedUser).not.toBeNull();
        expect(await hashService.compare(newPassword, updatedUser.password)).toBe(true);
      });
    });

    it('should throw if user with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { id, password } = userEntityTestFactory.create();

        try {
          await userService.setPassword(unitOfWork, id, password);
        } catch (error) {
          expect(error).toBeInstanceOf(UserNotFoundError);
        }
      });
    });
  });

  describe('Set email', () => {
    it(`should update user's email in db`, async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const userRepository = userRepositoryFactory.create(entityManager);

        const { phoneNumber, email, password } = userEntityTestFactory.create();

        const user = await userRepository.createOne({
          phoneNumber: phoneNumber as string,
          password,
        });

        await userService.setEmail(unitOfWork, user.id, email as string);

        const updatedUser = (await userRepository.findOneById(user.id)) as User;

        expect(updatedUser).not.toBeNull();
        expect(updatedUser.email).toBe(email);
      });
    });

    it(`should throw if user already has email set in db`, async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const userRepository = userRepositoryFactory.create(entityManager);

        const { email, password } = userEntityTestFactory.create();

        const user = await userRepository.createOne({
          email: email as string,
          password,
        });

        try {
          await userService.setEmail(unitOfWork, user.id, email as string);
        } catch (error) {
          expect(error).toBeInstanceOf(EmailAlreadySetError);
        }
      });
    });

    it(`should throw if email is already assigned to different user in db`, async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const userRepository = userRepositoryFactory.create(entityManager);

        const { email, phoneNumber, password } = userEntityTestFactory.create();

        await userRepository.createOne({
          email: email as string,
          password,
        });

        const user = await userRepository.createOne({
          phoneNumber: phoneNumber as string,
          password,
        });

        try {
          await userService.setEmail(unitOfWork, user.id, email as string);
        } catch (error) {
          expect(error).toBeInstanceOf(UserAlreadyExistsError);
        }
      });
    });

    it('should throw if user with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { id, email } = userEntityTestFactory.create();

        try {
          await userService.setEmail(unitOfWork, id, email as string);
        } catch (error) {
          expect(error).toBeInstanceOf(UserNotFoundError);
        }
      });
    });
  });

  describe('Set phone number', () => {
    it(`should update user's phone number in db`, async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const userRepository = userRepositoryFactory.create(entityManager);

        const { phoneNumber, email, password } = userEntityTestFactory.create();

        const user = await userRepository.createOne({
          email: email as string,
          password,
        });

        await userService.setPhoneNumber(unitOfWork, user.id, phoneNumber as string);

        const updatedUser = (await userRepository.findOneById(user.id)) as User;

        expect(updatedUser).not.toBeNull();
        expect(updatedUser.phoneNumber).toBe(phoneNumber);
      });
    });

    it(`should throw if user already has phone number set in db`, async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const userRepository = userRepositoryFactory.create(entityManager);

        const { phoneNumber, password } = userEntityTestFactory.create();

        const user = await userRepository.createOne({
          phoneNumber: phoneNumber as string,
          password,
        });

        try {
          await userService.setPhoneNumber(unitOfWork, user.id, phoneNumber as string);
        } catch (error) {
          expect(error).toBeInstanceOf(PhoneNumberAlreadySetError);
        }
      });
    });

    it(`should throw if phone number is already assigned to different user in db`, async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const userRepository = userRepositoryFactory.create(entityManager);

        const { email, phoneNumber, password } = userEntityTestFactory.create();

        await userRepository.createOne({
          phoneNumber: phoneNumber as string,
          password,
        });

        const user = await userRepository.createOne({
          email: email as string,
          password,
        });

        try {
          await userService.setPhoneNumber(unitOfWork, user.id, phoneNumber as string);
        } catch (error) {
          expect(error).toBeInstanceOf(UserAlreadyExistsError);
        }
      });
    });

    it('should throw if user with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { id, phoneNumber } = userEntityTestFactory.create();

        try {
          await userService.setPhoneNumber(unitOfWork, id, phoneNumber as string);
        } catch (error) {
          expect(error).toBeInstanceOf(UserNotFoundError);
        }
      });
    });
  });

  describe('Find user', () => {
    it('finds user by id in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const userRepository = userRepositoryFactory.create(entityManager);

        const { email, password } = userEntityTestFactory.create();

        const user = await userRepository.createOne({
          email: email as string,
          password,
        });

        const foundUser = await userService.findUser(unitOfWork, user.id);

        expect(foundUser).not.toBeNull();
      });
    });

    it('should throw if user with given id does not exist in db', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { id } = userEntityTestFactory.create();

        try {
          await userService.findUser(unitOfWork, id);
        } catch (error) {
          expect(error).toBeInstanceOf(UserNotFoundError);
        }
      });
    });
  });

  describe('Delete user', () => {
    it('deletes user from database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const userRepository = userRepositoryFactory.create(entityManager);

        const { email, password } = userEntityTestFactory.create();

        const user = await userRepository.createOne({
          email: email as string,
          password,
        });

        await userService.removeUser(unitOfWork, user.id);

        const userDto = await userRepository.findOneById(user.id);

        expect(userDto).toBeNull();
      });
    });

    it('should throw if user with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { id } = userEntityTestFactory.create();

        try {
          await userService.removeUser(unitOfWork, id);
        } catch (error) {
          expect(error).toBeInstanceOf(UserNotFoundError);
        }
      });
    });
  });
});
