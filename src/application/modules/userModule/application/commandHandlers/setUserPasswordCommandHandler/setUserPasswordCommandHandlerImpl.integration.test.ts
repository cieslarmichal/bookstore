import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { SetUserPasswordCommandHandler } from './setUserPasswordCommandHandler';
import { TestTransactionInternalRunner } from '../../../../../../common/tests/testTransactionInternalRunner';
import { postgresModuleSymbols } from '../../../../../../libs/postgres/postgresModuleSymbols';
import { Application } from '../../../../../application';
import { User } from '../../../domain/entities/user/user';
import { UserNotFoundError } from '../../errors/userNotFoundError';
import { symbols, userSymbols } from '../../../symbols';
import { UserEntityTestFactory } from '../../../tests/factories/userEntityTestFactory/userEntityTestFactory';
import { UserRepositoryFactory } from '../../repositories/userRepository/userRepositoryFactory';
import { HashService } from '../../services/hashService/hashService';

describe('SetUserPasswordCommandHandler', () => {
  let setUserPasswordCommandHandler: SetUserPasswordCommandHandler;
  let userRepositoryFactory: UserRepositoryFactory;
  let hashService: HashService;
  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

  const userEntityTestFactory = new UserEntityTestFactory();

  beforeAll(async () => {
    const container = Application.createContainer();

    setUserPasswordCommandHandler = container.get<SetUserPasswordCommandHandler>(symbols.setUserPasswordCommandHandler);
    userRepositoryFactory = container.get<UserRepositoryFactory>(userSymbols.userRepositoryFactory);
    hashService = container.get<HashService>(symbols.hashService);
    dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('Set password', () => {
    it(`should update user's password in db`, async () => {
      expect.assertions(2);

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

        const { password: newPassword } = userEntityTestFactory.create();

        await setUserPasswordCommandHandler.execute({ unitOfWork, userId: user.id, password: newPassword });

        const updatedUser = (await userRepository.findUser({ id: user.id })) as User;

        expect(updatedUser).not.toBeNull();
        expect(await hashService.compare(newPassword, updatedUser.password)).toBe(true);
      });
    });

    it('should throw if user with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { id, password } = userEntityTestFactory.create();

        try {
          await setUserPasswordCommandHandler.execute({ unitOfWork, userId: id, password });
        } catch (error) {
          expect(error).toBeInstanceOf(UserNotFoundError);
        }
      });
    });
  });
});
