import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { SetUserEmailCommandHandler } from './setUserEmailCommandHandler';
import { TestTransactionInternalRunner } from '../../../../../../common/tests/testTransactionInternalRunner';
import { postgresModuleSymbols } from '../../../../../../libs/postgres/postgresModuleSymbols';
import { Application } from '../../../../../application';
import { User } from '../../../domain/entities/user/user';
import { EmailAlreadySetError } from '../../../domain/errors/emailAlreadySetError';
import { UserAlreadyExistsError } from '../../errors/userAlreadyExistsError';
import { UserNotFoundError } from '../../errors/userNotFoundError';
import { symbols, userSymbols } from '../../../symbols';
import { UserEntityTestFactory } from '../../../tests/factories/userEntityTestFactory/userEntityTestFactory';
import { UserRepositoryFactory } from '../../repositories/userRepository/userRepositoryFactory';

describe('SetUserEmailCommandHandler', () => {
  let setUserEmailCommandHandler: SetUserEmailCommandHandler;
  let userRepositoryFactory: UserRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

  const userEntityTestFactory = new UserEntityTestFactory();

  beforeAll(async () => {
    const container = Application.createContainer();

    setUserEmailCommandHandler = container.get<SetUserEmailCommandHandler>(symbols.setUserEmailCommandHandler);
    userRepositoryFactory = container.get<UserRepositoryFactory>(userSymbols.userRepositoryFactory);
    dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it(`should update user's email in db`, async () => {
    expect.assertions(2);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const entityManager = unitOfWork.getEntityManager();

      const userRepository = userRepositoryFactory.create(entityManager);

      const { id, phoneNumber, email, password } = userEntityTestFactory.create();

      const user = await userRepository.createUser({
        id,
        phoneNumber: phoneNumber as string,
        password,
      });

      await setUserEmailCommandHandler.execute({ unitOfWork, userId: user.id, email: email as string });

      const updatedUser = (await userRepository.findUser({ id: user.id })) as User;

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

      const user = await userRepository.createUser({
        id,
        email: email as string,
        password,
      });

      try {
        await setUserEmailCommandHandler.execute({ unitOfWork, userId: user.id, email: email as string });
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

      await userRepository.createUser({
        id: userId1,
        email: email as string,
        password: password1,
      });

      const user = await userRepository.createUser({
        id: userId2,
        phoneNumber: phoneNumber as string,
        password: password2,
      });

      try {
        await setUserEmailCommandHandler.execute({ unitOfWork, userId: user.id, email: email as string });
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
        await setUserEmailCommandHandler.execute({ unitOfWork, userId: id, email: email as string });
      } catch (error) {
        expect(error).toBeInstanceOf(UserNotFoundError);
      }
    });
  });
});
