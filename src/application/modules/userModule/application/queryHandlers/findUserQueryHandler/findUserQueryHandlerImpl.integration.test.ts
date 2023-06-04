import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { FindUserQueryHandler } from './findUserQueryHandler';
import { TestTransactionInternalRunner } from '../../../../../../common/tests/testTransactionInternalRunner';
import { postgresModuleSymbols } from '../../../../../../libs/postgres/postgresModuleSymbols';
import { Application } from '../../../../../application';
import { UserNotFoundError } from '../../../infrastructure/errors/userNotFoundError';
import { symbols, userSymbols } from '../../../symbols';
import { UserEntityTestFactory } from '../../../tests/factories/userEntityTestFactory/userEntityTestFactory';
import { UserRepositoryFactory } from '../../repositories/userRepository/userRepositoryFactory';

describe('FindUserQueryHandler', () => {
  let findUserQueryHandler: FindUserQueryHandler;
  let userRepositoryFactory: UserRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

  const userEntityTestFactory = new UserEntityTestFactory();

  beforeAll(async () => {
    const container = Application.createContainer();

    findUserQueryHandler = container.get<FindUserQueryHandler>(symbols.findUserQueryHandler);
    userRepositoryFactory = container.get<UserRepositoryFactory>(userSymbols.userRepositoryFactory);
    dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('finds user by id in database', async () => {
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

      const { user: foundUser } = await findUserQueryHandler.execute({ unitOfWork, userId: user.id });

      expect(foundUser).not.toBeNull();
    });
  });

  it('should throw if user with given id does not exist in db', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const { id } = userEntityTestFactory.create();

      try {
        await findUserQueryHandler.execute({ unitOfWork, userId: id });
      } catch (error) {
        expect(error).toBeInstanceOf(UserNotFoundError);
      }
    });
  });
});
