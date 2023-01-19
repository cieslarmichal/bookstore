import { UserService } from './userService';
import { UserTestDataGenerator } from '../testDataGenerators/userTestDataGenerator';
import { ConfigLoader } from '../../../../configLoader';
import { createDIContainer, dbManager, UnitOfWorkModule } from '../../../common';
import { DbModule } from '../../../common';
import { UserModule } from '../userModule';
import { EmailAlreadySet, PhoneNumberAlreadySet, UserAlreadyExists, UserNotFound } from '../errors';
import { TokenService } from './tokenService';
import { HashService } from './hashService';
import { UserDto } from '../dtos';
import { UserRole } from '../types';
import { LoggerModule } from '../../../common/logger/loggerModule';
import { HASH_SERVICE, TOKEN_SERVICE, USER_REPOSITORY_FACTORY, USER_SERVICE } from '../userInjectionSymbols';
import { TestTransactionInternalRunner } from '../../../../integration/helpers';
import { UserRepositoryFactory } from '../repositories/userRepositoryFactory';

describe('UserService', () => {
  let userService: UserService;
  let userRepositoryFactory: UserRepositoryFactory;
  let tokenService: TokenService;
  let hashService: HashService;
  let userTestDataGenerator: UserTestDataGenerator;
  let testTransactionRunner: TestTransactionInternalRunner;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([DbModule, UserModule, LoggerModule, UnitOfWorkModule]);

    userService = container.resolve(USER_SERVICE);
    userRepositoryFactory = container.resolve(USER_REPOSITORY_FACTORY);
    tokenService = container.resolve(TOKEN_SERVICE);
    hashService = container.resolve(HASH_SERVICE);

    testTransactionRunner = new TestTransactionInternalRunner(container);

    userTestDataGenerator = new UserTestDataGenerator();
  });

  afterAll(async () => {
    dbManager.closeConnection();
  });

  describe('Register user by email', () => {
    it('creates user in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const userRepository = userRepositoryFactory.create(entityManager);

        const { email, password } = userTestDataGenerator.generateData();

        const createdUserDto = await userService.registerUserByEmail(unitOfWork, {
          email,
          password,
        });

        const userDto = await userRepository.findOneById(createdUserDto.id);

        expect(userDto).not.toBeNull();
      });
    });

    it('should not create user and throw if user with the same email already exists', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const userRepository = userRepositoryFactory.create(entityManager);

        const { email, password } = userTestDataGenerator.generateData();

        await userRepository.createOne({
          email,
          password,
        });

        try {
          await userService.registerUserByEmail(unitOfWork, {
            email,
            password,
          });
        } catch (error) {
          expect(error).toBeInstanceOf(UserAlreadyExists);
        }
      });
    });
  });

  describe('Register user by phone number', () => {
    it('creates user in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const userRepository = userRepositoryFactory.create(entityManager);

        const { phoneNumber, password } = userTestDataGenerator.generateData();

        const createdUserDto = await userService.registerUserByPhoneNumber(unitOfWork, {
          phoneNumber,
          password,
        });

        const userDto = await userRepository.findOneById(createdUserDto.id);

        expect(userDto).not.toBeNull();
      });
    });

    it('should not create user and throw if user with the same phone number already exists', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const userRepository = userRepositoryFactory.create(entityManager);

        const { phoneNumber, password } = userTestDataGenerator.generateData();

        await userRepository.createOne({
          phoneNumber,
          password,
        });

        try {
          await userService.registerUserByPhoneNumber(unitOfWork, {
            phoneNumber,
            password,
          });
        } catch (error) {
          expect(error).toBeInstanceOf(UserAlreadyExists);
        }
      });
    });
  });

  describe('Login user by email', () => {
    it('should return access token', async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const userRepository = userRepositoryFactory.create(entityManager);

        const { email, password } = userTestDataGenerator.generateData();

        const hashedPassword = await hashService.hash(password);

        const user = await userRepository.createOne({
          email,
          password: hashedPassword,
        });

        const accessToken = await userService.loginUserByEmail(unitOfWork, {
          email,
          password,
        });

        const data = await tokenService.verifyToken(accessToken);

        expect(data.id).toBe(user.id);
        expect(data.role).toBe(UserRole.user);
      });
    });

    it('should throw if user with given email does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { email, password } = userTestDataGenerator.generateData();

        try {
          await userService.loginUserByEmail(unitOfWork, {
            email,
            password,
          });
        } catch (error) {
          expect(error).toBeInstanceOf(UserNotFound);
        }
      });
    });

    it('should throw if user password does not match db password', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const userRepository = userRepositoryFactory.create(entityManager);

        const { email, password } = userTestDataGenerator.generateData();

        const { password: otherPassword } = userTestDataGenerator.generateData();

        await userRepository.createOne({
          email,
          password,
        });

        try {
          await userService.loginUserByEmail(unitOfWork, {
            email,
            password: otherPassword,
          });
        } catch (error) {
          expect(error).toBeInstanceOf(UserNotFound);
        }
      });
    });
  });

  describe('Login user by phone number', () => {
    it('should return access token', async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const userRepository = userRepositoryFactory.create(entityManager);

        const { phoneNumber, password } = userTestDataGenerator.generateData();

        const hashedPassword = await hashService.hash(password);

        const user = await userRepository.createOne({
          phoneNumber,
          password: hashedPassword,
        });

        const accessToken = await userService.loginUserByPhoneNumber(unitOfWork, {
          phoneNumber,
          password,
        });

        const data = await tokenService.verifyToken(accessToken);

        expect(data.id).toBe(user.id);
        expect(data.role).toBe(UserRole.user);
      });
    });

    it('should throw if user with given email does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { phoneNumber, password } = userTestDataGenerator.generateData();

        try {
          await userService.loginUserByPhoneNumber(unitOfWork, {
            phoneNumber,
            password,
          });
        } catch (error) {
          expect(error).toBeInstanceOf(UserNotFound);
        }
      });
    });

    it('should throw if user password does not match db password', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const userRepository = userRepositoryFactory.create(entityManager);

        const { phoneNumber, password } = userTestDataGenerator.generateData();

        const { password: otherPassword } = userTestDataGenerator.generateData();

        await userRepository.createOne({
          phoneNumber,
          password,
        });

        try {
          await userService.loginUserByPhoneNumber(unitOfWork, {
            phoneNumber,
            password: otherPassword,
          });
        } catch (error) {
          expect(error).toBeInstanceOf(UserNotFound);
        }
      });
    });
  });

  describe('Set password', () => {
    it(`should update user's password in db`, async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const userRepository = userRepositoryFactory.create(entityManager);

        const { email, password } = userTestDataGenerator.generateData();

        const hashedPassword = await hashService.hash(password);

        const user = await userRepository.createOne({
          email,
          password: hashedPassword,
        });

        const { password: newPassword } = userTestDataGenerator.generateData();

        await userService.setPassword(unitOfWork, user.id, newPassword);

        const updatedUser = (await userRepository.findOneById(user.id)) as UserDto;

        expect(updatedUser).not.toBeNull();
        expect(await hashService.compare(newPassword, updatedUser.password)).toBe(true);
      });
    });

    it('should throw if user with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { id, password } = userTestDataGenerator.generateData();

        try {
          await userService.setPassword(unitOfWork, id, password);
        } catch (error) {
          expect(error).toBeInstanceOf(UserNotFound);
        }
      });
    });
  });

  describe('Set email', () => {
    it(`should update user's email in db`, async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const userRepository = userRepositoryFactory.create(entityManager);

        const { phoneNumber, email, password } = userTestDataGenerator.generateData();

        const user = await userRepository.createOne({
          phoneNumber,
          password,
        });

        await userService.setEmail(unitOfWork, user.id, email);

        const updatedUser = (await userRepository.findOneById(user.id)) as UserDto;

        expect(updatedUser).not.toBeNull();
        expect(updatedUser.email).toBe(email);
      });
    });

    it(`should throw if user already has email set in db`, async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const userRepository = userRepositoryFactory.create(entityManager);

        const { email, password } = userTestDataGenerator.generateData();

        const user = await userRepository.createOne({
          email,
          password,
        });

        try {
          await userService.setEmail(unitOfWork, user.id, email);
        } catch (error) {
          expect(error).toBeInstanceOf(EmailAlreadySet);
        }
      });
    });

    it(`should throw if email is already assigned to different user in db`, async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const userRepository = userRepositoryFactory.create(entityManager);

        const { email, phoneNumber, password } = userTestDataGenerator.generateData();

        await userRepository.createOne({
          email,
          password,
        });

        const user = await userRepository.createOne({
          phoneNumber,
          password,
        });

        try {
          await userService.setEmail(unitOfWork, user.id, email);
        } catch (error) {
          expect(error).toBeInstanceOf(UserAlreadyExists);
        }
      });
    });

    it('should throw if user with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { id, email } = userTestDataGenerator.generateData();

        try {
          await userService.setEmail(unitOfWork, id, email);
        } catch (error) {
          expect(error).toBeInstanceOf(UserNotFound);
        }
      });
    });
  });

  describe('Set phone number', () => {
    it(`should update user's phone number in db`, async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const userRepository = userRepositoryFactory.create(entityManager);

        const { phoneNumber, email, password } = userTestDataGenerator.generateData();

        const user = await userRepository.createOne({
          email,
          password,
        });

        await userService.setPhoneNumber(unitOfWork, user.id, phoneNumber);

        const updatedUser = (await userRepository.findOneById(user.id)) as UserDto;

        expect(updatedUser).not.toBeNull();
        expect(updatedUser.phoneNumber).toBe(phoneNumber);
      });
    });

    it(`should throw if user already has phone number set in db`, async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const userRepository = userRepositoryFactory.create(entityManager);

        const { phoneNumber, password } = userTestDataGenerator.generateData();

        const user = await userRepository.createOne({
          phoneNumber,
          password,
        });

        try {
          await userService.setPhoneNumber(unitOfWork, user.id, phoneNumber);
        } catch (error) {
          expect(error).toBeInstanceOf(PhoneNumberAlreadySet);
        }
      });
    });

    it(`should throw if phone number is already assigned to different user in db`, async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const userRepository = userRepositoryFactory.create(entityManager);

        const { email, phoneNumber, password } = userTestDataGenerator.generateData();

        await userRepository.createOne({
          phoneNumber,
          password,
        });

        const user = await userRepository.createOne({
          email,
          password,
        });

        try {
          await userService.setPhoneNumber(unitOfWork, user.id, phoneNumber);
        } catch (error) {
          expect(error).toBeInstanceOf(UserAlreadyExists);
        }
      });
    });

    it('should throw if user with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { id, phoneNumber } = userTestDataGenerator.generateData();

        try {
          await userService.setPhoneNumber(unitOfWork, id, phoneNumber);
        } catch (error) {
          expect(error).toBeInstanceOf(UserNotFound);
        }
      });
    });
  });

  describe('Find user', () => {
    it('finds user by id in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const userRepository = userRepositoryFactory.create(entityManager);

        const { email, password } = userTestDataGenerator.generateData();

        const user = await userRepository.createOne({
          email,
          password,
        });

        const foundUser = await userService.findUser(unitOfWork, user.id);

        expect(foundUser).not.toBeNull();
      });
    });

    it('should throw if user with given id does not exist in db', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { id } = userTestDataGenerator.generateData();

        try {
          await userService.findUser(unitOfWork, id);
        } catch (error) {
          expect(error).toBeInstanceOf(UserNotFound);
        }
      });
    });
  });

  describe('Remove user', () => {
    it('removes user from database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const userRepository = userRepositoryFactory.create(entityManager);

        const { email, password } = userTestDataGenerator.generateData();

        const user = await userRepository.createOne({
          email,
          password,
        });

        await userService.removeUser(unitOfWork, user.id);

        const userDto = await userRepository.findOneById(user.id);

        expect(userDto).toBeNull();
      });
    });

    it('should throw if user with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { id } = userTestDataGenerator.generateData();

        try {
          await userService.removeUser(unitOfWork, id);
        } catch (error) {
          expect(error).toBeInstanceOf(UserNotFound);
        }
      });
    });
  });
});
