import { ConfigLoader } from '../../../../../../configLoader';
import { postgresConnector } from '../../../../../libs/postgres/postgresConnector';
import { PostgresModule } from '../../../../../libs/postgres/postgresModule';
import { createDependencyInjectionContainer } from '../../../../../libs/dependencyInjection/container';
import { LoggerModule } from '../../../../../libs/logger/loggerModule';
import { UnitOfWorkModule } from '../../../../../libs/unitOfWork/unitOfWorkModule';
import { TestTransactionInternalRunner } from '../../../../../tests/helpers';
import { UserRepositoryFactory } from '../../../contracts/factories/userRepositoryFactory/userRepositoryFactory';
import { HashService } from '../../../contracts/services/hashService/hashService';
import { TokenService } from '../../../contracts/services/tokenService/tokenService';
import { UserService } from '../../../contracts/services/userService/userService';
import { User } from '../../../contracts/user';
import { UserRole } from '../../../contracts/userRole';
import { EmailAlreadySet } from '../../../errors/emailAlreadySet';
import { PhoneNumberAlreadySet } from '../../../errors/phoneNumberAlreadySet';
import { UserAlreadyExists } from '../../../errors/userAlreadyExists';
import { UserNotFound } from '../../../errors/userNotFound';
import { UserEntityTestFactory } from '../../../tests/factories/userEntityTestFactory/userEntityTestFactory';
import { UserModule } from '../../../userModule';
import { userSymbols } from '../../../userSymbols';

describe('UserServiceImpl', () => {
  let userService: UserService;
  let userRepositoryFactory: UserRepositoryFactory;
  let tokenService: TokenService;
  let hashService: HashService;
  let userEntityTestFactory: UserEntityTestFactory;
  let testTransactionRunner: TestTransactionInternalRunner;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDependencyInjectionContainer([
      PostgresModule,
      UserModule,
      LoggerModule,
      UnitOfWorkModule,
    ]);

    userService = container.resolve(userSymbols.userService);
    userRepositoryFactory = container.resolve(userSymbols.userRepositoryFactory);
    tokenService = container.resolve(userSymbols.tokenService);
    hashService = container.resolve(userSymbols.hashService);

    testTransactionRunner = new TestTransactionInternalRunner(container);

    userEntityTestFactory = new UserEntityTestFactory();
  });

  afterAll(async () => {
    postgresConnector.closeConnection();
  });

  describe('Register user by email', () => {
    it('creates user in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const userRepository = userRepositoryFactory.create(entityManager);

        const { email, password } = userEntityTestFactory.create();

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

        const { email, password } = userEntityTestFactory.create();

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

        const { phoneNumber, password } = userEntityTestFactory.create();

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

        const { phoneNumber, password } = userEntityTestFactory.create();

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

        const { email, password } = userEntityTestFactory.create();

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
        const { email, password } = userEntityTestFactory.create();

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

        const { email, password } = userEntityTestFactory.create();

        const { password: otherPassword } = userEntityTestFactory.create();

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

        const { phoneNumber, password } = userEntityTestFactory.create();

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
        const { phoneNumber, password } = userEntityTestFactory.create();

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

        const { phoneNumber, password } = userEntityTestFactory.create();

        const { password: otherPassword } = userEntityTestFactory.create();

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

        const { email, password } = userEntityTestFactory.create();

        const hashedPassword = await hashService.hash(password);

        const user = await userRepository.createOne({
          email,
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

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { id, password } = userEntityTestFactory.create();

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

        const { phoneNumber, email, password } = userEntityTestFactory.create();

        const user = await userRepository.createOne({
          phoneNumber,
          password,
        });

        await userService.setEmail(unitOfWork, user.id, email);

        const updatedUser = (await userRepository.findOneById(user.id)) as User;

        expect(updatedUser).not.toBeNull();
        expect(updatedUser.email).toBe(email);
      });
    });

    it(`should throw if user already has email set in db`, async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const userRepository = userRepositoryFactory.create(entityManager);

        const { email, password } = userEntityTestFactory.create();

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

        const { email, phoneNumber, password } = userEntityTestFactory.create();

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
        const { id, email } = userEntityTestFactory.create();

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

        const { phoneNumber, email, password } = userEntityTestFactory.create();

        const user = await userRepository.createOne({
          email,
          password,
        });

        await userService.setPhoneNumber(unitOfWork, user.id, phoneNumber);

        const updatedUser = (await userRepository.findOneById(user.id)) as User;

        expect(updatedUser).not.toBeNull();
        expect(updatedUser.phoneNumber).toBe(phoneNumber);
      });
    });

    it(`should throw if user already has phone number set in db`, async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const userRepository = userRepositoryFactory.create(entityManager);

        const { phoneNumber, password } = userEntityTestFactory.create();

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

        const { email, phoneNumber, password } = userEntityTestFactory.create();

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
        const { id, phoneNumber } = userEntityTestFactory.create();

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

        const { email, password } = userEntityTestFactory.create();

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
        const { id } = userEntityTestFactory.create();

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

        const { email, password } = userEntityTestFactory.create();

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
        const { id } = userEntityTestFactory.create();

        try {
          await userService.removeUser(unitOfWork, id);
        } catch (error) {
          expect(error).toBeInstanceOf(UserNotFound);
        }
      });
    });
  });
});
