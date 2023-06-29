import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { RegisterUserCommandHandler } from './registerUserCommandHandler';
import { TestTransactionInternalRunner } from '../../../../../../common/tests/testTransactionInternalRunner';
import { postgresModuleSymbols } from '../../../../../../libs/postgres/postgresModuleSymbols';
import { Application } from '../../../../../application';
import { symbols, userSymbols } from '../../../symbols';
import { UserEntityTestFactory } from '../../../tests/factories/userEntityTestFactory/userEntityTestFactory';
import { UserAlreadyExistsError } from '../../errors/userAlreadyExistsError';
import { UserRepositoryFactory } from '../../repositories/userRepository/userRepositoryFactory';

describe('RegisterUserCommandHandler', () => {
  let registerUserCommandHandler: RegisterUserCommandHandler;
  let userRepositoryFactory: UserRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

  const userEntityTestFactory = new UserEntityTestFactory();

  beforeAll(async () => {
    const container = Application.createContainer();

    registerUserCommandHandler = container.get<RegisterUserCommandHandler>(symbols.registerUserCommandHandler);
    userRepositoryFactory = container.get<UserRepositoryFactory>(userSymbols.userRepositoryFactory);
    dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('Register user by email', () => {
    it('creates user in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const { email, password } = userEntityTestFactory.create();

        const { user } = await registerUserCommandHandler.execute({
          unitOfWork,
          draft: {
            email: email as string,
            password,
          },
        });

        const foundUser = await userRepository.findUser({ id: user.id });

        expect(foundUser).not.toBeNull();
      });
    });

    it('should not create user and throw if user with the same email already exists', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const { id, email, password } = userEntityTestFactory.create();

        await userRepository.createUser({
          id,
          email: email as string,
          password,
        });

        try {
          await registerUserCommandHandler.execute({
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

        const { user } = await registerUserCommandHandler.execute({
          unitOfWork,
          draft: {
            phoneNumber: phoneNumber as string,
            password,
          },
        });

        const foundUser = await userRepository.findUser({ id: user.id });

        expect(foundUser).not.toBeNull();
      });
    });

    it('should not create user and throw if user with the same phone number already exists', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const { id, phoneNumber, password } = userEntityTestFactory.create();

        await userRepository.createUser({
          id,
          phoneNumber: phoneNumber as string,
          password,
        });

        try {
          await registerUserCommandHandler.execute({
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
});
