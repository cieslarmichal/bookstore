import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { LoginUserCommandHandler } from './loginUserCommandHandler';
import { TestTransactionInternalRunner } from '../../../../../../common/tests/testTransactionInternalRunner';
import { postgresModuleSymbols } from '../../../../../../libs/postgres/postgresModuleSymbols';
import { Application } from '../../../../../application';
import { UserNotFoundError } from '../../errors/userNotFoundError';
import { symbols, userSymbols } from '../../../symbols';
import { UserEntityTestFactory } from '../../../tests/factories/userEntityTestFactory/userEntityTestFactory';
import { UserRepositoryFactory } from '../../repositories/userRepository/userRepositoryFactory';
import { HashService } from '../../services/hashService/hashService';
import { TokenService } from '../../services/tokenService/tokenService';

describe('LoginUserCommandHandler', () => {
  let loginUserCommandHandler: LoginUserCommandHandler;
  let userRepositoryFactory: UserRepositoryFactory;
  let tokenService: TokenService;
  let hashService: HashService;
  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

  const userEntityTestFactory = new UserEntityTestFactory();

  beforeAll(async () => {
    const container = Application.createContainer();

    loginUserCommandHandler = container.get<LoginUserCommandHandler>(symbols.loginUserCommandHandler);
    userRepositoryFactory = container.get<UserRepositoryFactory>(userSymbols.userRepositoryFactory);
    tokenService = container.get<TokenService>(userSymbols.tokenService);
    hashService = container.get<HashService>(symbols.hashService);
    dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('Login user by email', () => {
    it('should return access token', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const { id, email, password } = userEntityTestFactory.create();

        const hashedPassword = await hashService.hash(password);

        const user = await userRepository.createUser({
          id,
          email: email as string,
          password: hashedPassword,
        });

        const { accessToken } = await loginUserCommandHandler.execute({
          unitOfWork,
          draft: {
            email: email as string,
            password,
          },
        });

        const data = tokenService.verifyToken(accessToken);

        expect(data['id']).toBe(user.id);
      });
    });

    it('should throw if user with given email does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { email, password } = userEntityTestFactory.create();

        try {
          await loginUserCommandHandler.execute({
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

        await userRepository.createUser({
          id,
          email: email as string,
          password,
        });

        try {
          await loginUserCommandHandler.execute({
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
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const { id, phoneNumber, password } = userEntityTestFactory.create();

        const hashedPassword = await hashService.hash(password);

        const user = await userRepository.createUser({
          id,
          phoneNumber: phoneNumber as string,
          password: hashedPassword,
        });

        const { accessToken } = await loginUserCommandHandler.execute({
          unitOfWork,
          draft: {
            phoneNumber: phoneNumber as string,
            password,
          },
        });

        const data = tokenService.verifyToken(accessToken);

        expect(data['id']).toBe(user.id);
      });
    });

    it('should throw if user with given email does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { phoneNumber, password } = userEntityTestFactory.create();

        try {
          await loginUserCommandHandler.execute({
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

        await userRepository.createUser({
          id,
          phoneNumber: phoneNumber as string,
          password,
        });

        try {
          await loginUserCommandHandler.execute({
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
});
