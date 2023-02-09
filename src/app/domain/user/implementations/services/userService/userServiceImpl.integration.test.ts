import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { TestTransactionInternalRunner } from '../../../../../integrations/common/tests/unitOfWork/testTransactionInternalRunner';
import { DependencyInjectionContainerFactory } from '../../../../../libs/dependencyInjection/implementations/factories/dependencyInjectionContainerFactory/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../../../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../../../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../../../../libs/postgres/postgresModule';
import { postgresSymbols } from '../../../../../libs/postgres/postgresSymbols';
import { PostgresModuleConfigTestFactory } from '../../../../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';
import { UnitOfWorkModule } from '../../../../../libs/unitOfWork/unitOfWorkModule';
import { AddressEntity } from '../../../../address/contracts/addressEntity';
import { AuthorEntity } from '../../../../author/contracts/authorEntity';
import { AuthorBookEntity } from '../../../../authorBook/contracts/authorBookEntity';
import { BookEntity } from '../../../../book/contracts/bookEntity';
import { BookCategoryEntity } from '../../../../bookCategory/contracts/bookCategoryEntity';
import { CategoryEntity } from '../../../../category/contracts/categoryEntity';
import { CustomerEntity } from '../../../../customer/contracts/customerEntity';
import { UserRepositoryFactory } from '../../../contracts/factories/userRepositoryFactory/userRepositoryFactory';
import { HashService } from '../../../contracts/services/hashService/hashService';
import { TokenService } from '../../../contracts/services/tokenService/tokenService';
import { UserService } from '../../../contracts/services/userService/userService';
import { User } from '../../../contracts/user';
import { UserEntity } from '../../../contracts/userEntity';
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
  let userService: UserService;
  let userRepositoryFactory: UserRepositoryFactory;
  let tokenService: TokenService;
  let hashService: HashService;
  let testTransactionRunner: TestTransactionInternalRunner;
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

  beforeAll(async () => {
    const container = await DependencyInjectionContainerFactory.create({
      modules: [
        new PostgresModule(postgresModuleConfig),
        new UserModule(userModuleConfig),
        new LoggerModule(loggerModuleConfig),
        new UnitOfWorkModule(),
      ],
    });

    userService = container.get<UserService>(userSymbols.userService);
    userRepositoryFactory = container.get<UserRepositoryFactory>(userSymbols.userRepositoryFactory);
    tokenService = container.get<TokenService>(userSymbols.tokenService);
    hashService = container.get<HashService>(userSymbols.hashService);
    dataSource = container.get<DataSource>(postgresSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    dataSource.destroy();
  });

  describe('Register user by email', () => {
    it('creates user in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const { email, password } = userEntityTestFactory.create();

        const user = await userService.registerUserByEmail({
          unitOfWork,
          draft: {
            email: email as string,
            password,
          },
        });

        const foundUser = await userRepository.findOne({ id: user.id });

        expect(foundUser).not.toBeNull();
      });
    });

    it('should not create user and throw if user with the same email already exists', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const { id, email, password } = userEntityTestFactory.create();

        await userRepository.createOne({
          id,
          email: email as string,
          password,
          role: UserRole.user,
        });

        try {
          await userService.registerUserByEmail({
            unitOfWork,
            draft: {
              email: email as string,
              password,
            },
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

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const { phoneNumber, password } = userEntityTestFactory.create();

        const user = await userService.registerUserByPhoneNumber({
          unitOfWork,
          draft: {
            phoneNumber: phoneNumber as string,
            password,
          },
        });

        const foundUser = await userRepository.findOne({ id: user.id });

        expect(foundUser).not.toBeNull();
      });
    });

    it('should not create user and throw if user with the same phone number already exists', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const { id, phoneNumber, password } = userEntityTestFactory.create();

        await userRepository.createOne({
          id,
          phoneNumber: phoneNumber as string,
          password,
          role: UserRole.user,
        });

        try {
          await userService.registerUserByPhoneNumber({
            unitOfWork,
            draft: {
              phoneNumber: phoneNumber as string,
              password,
            },
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

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const { id, email, password } = userEntityTestFactory.create();

        const hashedPassword = await hashService.hash(password);

        const user = await userRepository.createOne({
          id,
          email: email as string,
          password: hashedPassword,
          role: UserRole.user,
        });

        const accessToken = await userService.loginUserByEmail({
          unitOfWork,
          draft: {
            email: email as string,
            password,
          },
        });

        const data = await tokenService.verifyToken(accessToken);

        expect(data['id']).toBe(user.id);
        expect(data['role']).toBe(UserRole.user);
      });
    });

    it('should throw if user with given email does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { email, password } = userEntityTestFactory.create();

        try {
          await userService.loginUserByEmail({
            unitOfWork,
            draft: {
              email: email as string,
              password,
            },
          });
        } catch (error) {
          expect(error).toBeInstanceOf(UserNotFoundError);
        }
      });
    });

    it('should throw if user password does not match db password', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const { id, email, password } = userEntityTestFactory.create();

        const { password: otherPassword } = userEntityTestFactory.create();

        await userRepository.createOne({
          id,
          email: email as string,
          password,
          role: UserRole.user,
        });

        try {
          await userService.loginUserByEmail({
            unitOfWork,
            draft: {
              email: email as string,
              password: otherPassword,
            },
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

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const { id, phoneNumber, password } = userEntityTestFactory.create();

        const hashedPassword = await hashService.hash(password);

        const user = await userRepository.createOne({
          id,
          phoneNumber: phoneNumber as string,
          password: hashedPassword,
          role: UserRole.user,
        });

        const accessToken = await userService.loginUserByPhoneNumber({
          unitOfWork,
          draft: {
            phoneNumber: phoneNumber as string,
            password,
          },
        });

        const data = await tokenService.verifyToken(accessToken);

        expect(data['id']).toBe(user.id);
        expect(data['role']).toBe(UserRole.user);
      });
    });

    it('should throw if user with given email does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { phoneNumber, password } = userEntityTestFactory.create();

        try {
          await userService.loginUserByPhoneNumber({
            unitOfWork,
            draft: {
              phoneNumber: phoneNumber as string,
              password,
            },
          });
        } catch (error) {
          expect(error).toBeInstanceOf(UserNotFoundError);
        }
      });
    });

    it('should throw if user password does not match db password', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const { id, phoneNumber, password } = userEntityTestFactory.create();

        const { password: otherPassword } = userEntityTestFactory.create();

        await userRepository.createOne({
          id,
          phoneNumber: phoneNumber as string,
          password,
          role: UserRole.user,
        });

        try {
          await userService.loginUserByPhoneNumber({
            unitOfWork,
            draft: {
              phoneNumber: phoneNumber as string,
              password: otherPassword,
            },
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

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const { id, email, password } = userEntityTestFactory.create();

        const hashedPassword = await hashService.hash(password);

        const user = await userRepository.createOne({
          id,
          email: email as string,
          password: hashedPassword,
          role: UserRole.user,
        });

        const { password: newPassword } = userEntityTestFactory.create();

        await userService.setUserPassword({ unitOfWork, userId: user.id, password: newPassword });

        const updatedUser = (await userRepository.findOne({ id: user.id })) as User;

        expect(updatedUser).not.toBeNull();
        expect(await hashService.compare(newPassword, updatedUser.password)).toBe(true);
      });
    });

    it('should throw if user with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { id, password } = userEntityTestFactory.create();

        try {
          await userService.setUserPassword({ unitOfWork, userId: id, password });
        } catch (error) {
          expect(error).toBeInstanceOf(UserNotFoundError);
        }
      });
    });
  });

  describe('Set email', () => {
    it(`should update user's email in db`, async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const { id, phoneNumber, email, password } = userEntityTestFactory.create();

        const user = await userRepository.createOne({
          id,
          phoneNumber: phoneNumber as string,
          password,
          role: UserRole.user,
        });

        await userService.setUserEmail({ unitOfWork, userId: user.id, email: email as string });

        const updatedUser = (await userRepository.findOne({ id: user.id })) as User;

        expect(updatedUser).not.toBeNull();
        expect(updatedUser.email).toBe(email);
      });
    });

    it(`should throw if user already has email set in db`, async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const { id, email, password } = userEntityTestFactory.create();

        const user = await userRepository.createOne({
          id,
          email: email as string,
          password,
          role: UserRole.user,
        });

        try {
          await userService.setUserEmail({ unitOfWork, userId: user.id, email: email as string });
        } catch (error) {
          expect(error).toBeInstanceOf(EmailAlreadySetError);
        }
      });
    });

    it(`should throw if email is already assigned to different user in db`, async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const { id: userId1, email, password: password1 } = userEntityTestFactory.create();

        const { id: userId2, phoneNumber, password: password2 } = userEntityTestFactory.create();

        await userRepository.createOne({
          id: userId1,
          email: email as string,
          password: password1,
          role: UserRole.user,
        });

        const user = await userRepository.createOne({
          id: userId2,
          phoneNumber: phoneNumber as string,
          password: password2,
          role: UserRole.user,
        });

        try {
          await userService.setUserEmail({ unitOfWork, userId: user.id, email: email as string });
        } catch (error) {
          expect(error).toBeInstanceOf(UserAlreadyExistsError);
        }
      });
    });

    it('should throw if user with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { id, email } = userEntityTestFactory.create();

        try {
          await userService.setUserEmail({ unitOfWork, userId: id, email: email as string });
        } catch (error) {
          expect(error).toBeInstanceOf(UserNotFoundError);
        }
      });
    });
  });

  describe('Set phone number', () => {
    it(`should update user's phone number in db`, async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const { id, phoneNumber, email, password } = userEntityTestFactory.create();

        const user = await userRepository.createOne({
          id,
          email: email as string,
          password,
          role: UserRole.user,
        });

        await userService.setUserPhoneNumber({ unitOfWork, userId: user.id, phoneNumber: phoneNumber as string });

        const updatedUser = (await userRepository.findOne({ id: user.id })) as User;

        expect(updatedUser).not.toBeNull();
        expect(updatedUser.phoneNumber).toBe(phoneNumber);
      });
    });

    it(`should throw if user already has phone number set in db`, async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const { id, phoneNumber, password } = userEntityTestFactory.create();

        const user = await userRepository.createOne({
          id,
          phoneNumber: phoneNumber as string,
          password,
          role: UserRole.user,
        });

        try {
          await userService.setUserPhoneNumber({ unitOfWork, userId: user.id, phoneNumber: phoneNumber as string });
        } catch (error) {
          expect(error).toBeInstanceOf(PhoneNumberAlreadySetError);
        }
      });
    });

    it(`should throw if phone number is already assigned to different user in db`, async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const { id: userId1, phoneNumber, password } = userEntityTestFactory.create();

        const { id: userId2, email } = userEntityTestFactory.create();

        await userRepository.createOne({
          id: userId1,
          phoneNumber: phoneNumber as string,
          password,
          role: UserRole.user,
        });

        const user = await userRepository.createOne({
          id: userId2,
          email: email as string,
          password,
          role: UserRole.user,
        });

        try {
          await userService.setUserPhoneNumber({ unitOfWork, userId: user.id, phoneNumber: phoneNumber as string });
        } catch (error) {
          expect(error).toBeInstanceOf(UserAlreadyExistsError);
        }
      });
    });

    it('should throw if user with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { id, phoneNumber } = userEntityTestFactory.create();

        try {
          await userService.setUserPhoneNumber({ unitOfWork, userId: id, phoneNumber: phoneNumber as string });
        } catch (error) {
          expect(error).toBeInstanceOf(UserNotFoundError);
        }
      });
    });
  });

  describe('Find user', () => {
    it('finds user by id in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const { id, email, password } = userEntityTestFactory.create();

        const user = await userRepository.createOne({
          id,
          email: email as string,
          password,
          role: UserRole.user,
        });

        const foundUser = await userService.findUser({ unitOfWork, userId: user.id });

        expect(foundUser).not.toBeNull();
      });
    });

    it('should throw if user with given id does not exist in db', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { id } = userEntityTestFactory.create();

        try {
          await userService.findUser({ unitOfWork, userId: id });
        } catch (error) {
          expect(error).toBeInstanceOf(UserNotFoundError);
        }
      });
    });
  });

  describe('Delete user', () => {
    it('deletes user from database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const { id, email, password } = userEntityTestFactory.create();

        const user = await userRepository.createOne({
          id,
          email: email as string,
          password,
          role: UserRole.user,
        });

        await userService.deleteUser({ unitOfWork, userId: user.id });

        const foundUser = await userRepository.findOne({ id: user.id });

        expect(foundUser).toBeNull();
      });
    });

    it('should throw if user with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { id } = userEntityTestFactory.create();

        try {
          await userService.deleteUser({ unitOfWork, userId: id });
        } catch (error) {
          expect(error).toBeInstanceOf(UserNotFoundError);
        }
      });
    });
  });
});
