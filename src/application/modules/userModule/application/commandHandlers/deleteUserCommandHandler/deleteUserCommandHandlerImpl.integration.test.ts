import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { DeleteUserCommandHandler } from './deleteUserCommandHandler';
import { TestTransactionInternalRunner } from '../../../../../../common/tests/testTransactionInternalRunner';
import { postgresModuleSymbols } from '../../../../../../libs/postgres/postgresModuleSymbols';
import { Application } from '../../../../../application';
import { UserNotFoundError } from '../../../infrastructure/errors/userNotFoundError';
import { symbols, userSymbols } from '../../../symbols';
import { UserEntityTestFactory } from '../../../tests/factories/userEntityTestFactory/userEntityTestFactory';
import { UserRepositoryFactory } from '../../repositories/userRepository/userRepositoryFactory';

describe('DeleteUserCommandHandler', () => {
  let deleteUserCommandHandler: DeleteUserCommandHandler;
  let userRepositoryFactory: UserRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

  const userEntityTestFactory = new UserEntityTestFactory();

  beforeAll(async () => {
    const container = Application.createContainer();

    deleteUserCommandHandler = container.get<DeleteUserCommandHandler>(symbols.deleteUserCommandHandler);
    userRepositoryFactory = container.get<UserRepositoryFactory>(userSymbols.userRepositoryFactory);
    dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('deletes user from database', async () => {
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

      await deleteUserCommandHandler.execute({ unitOfWork, userId: user.id });

      const foundUser = await userRepository.findUser({ id: user.id });

      expect(foundUser).toBeNull();
    });
  });

  it('should throw if user with given id does not exist', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const { id } = userEntityTestFactory.create();

      try {
        await deleteUserCommandHandler.execute({ unitOfWork, userId: id });
      } catch (error) {
        expect(error).toBeInstanceOf(UserNotFoundError);
      }
    });
  });
});
