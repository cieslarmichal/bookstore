import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { SetUserPhoneNumberCommandHandler } from './setUserPhoneNumberCommandHandler';
import { TestTransactionInternalRunner } from '../../../../../../common/tests/testTransactionInternalRunner';
import { postgresModuleSymbols } from '../../../../../../libs/postgres/postgresModuleSymbols';
import { Application } from '../../../../../application';
import { User } from '../../../domain/entities/user/user';
import { PhoneNumberAlreadySetError } from '../../../domain/errors/phoneNumberAlreadySetError';
import { UserAlreadyExistsError } from '../../../infrastructure/errors/userAlreadyExistsError';
import { UserNotFoundError } from '../../../infrastructure/errors/userNotFoundError';
import { symbols, userSymbols } from '../../../symbols';
import { UserEntityTestFactory } from '../../../tests/factories/userEntityTestFactory/userEntityTestFactory';
import { UserRepositoryFactory } from '../../repositories/userRepository/userRepositoryFactory';

describe('SetUserPhoneNumberCommandHandler', () => {
  let setUserPhoneNumberCommandHandler: SetUserPhoneNumberCommandHandler;
  let userRepositoryFactory: UserRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

  const userEntityTestFactory = new UserEntityTestFactory();

  beforeAll(async () => {
    const container = Application.createContainer();

    setUserPhoneNumberCommandHandler = container.get<SetUserPhoneNumberCommandHandler>(
      symbols.setUserPhoneNumberCommandHandler,
    );
    userRepositoryFactory = container.get<UserRepositoryFactory>(userSymbols.userRepositoryFactory);
    dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it(`should update user's phone number in db`, async () => {
    expect.assertions(2);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const entityManager = unitOfWork.getEntityManager();

      const userRepository = userRepositoryFactory.create(entityManager);

      const { id, phoneNumber, email, password } = userEntityTestFactory.create();

      const user = await userRepository.createUser({
        id,
        email: email as string,
        password,
      });

      await setUserPhoneNumberCommandHandler.execute({
        unitOfWork,
        userId: user.id,
        phoneNumber: phoneNumber as string,
      });

      const updatedUser = (await userRepository.findUser({ id: user.id })) as User;

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

      const user = await userRepository.createUser({
        id,
        phoneNumber: phoneNumber as string,
        password,
      });

      try {
        await setUserPhoneNumberCommandHandler.execute({
          unitOfWork,
          userId: user.id,
          phoneNumber: phoneNumber as string,
        });
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

      await userRepository.createUser({
        id: userId1,
        phoneNumber: phoneNumber as string,
        password,
      });

      const user = await userRepository.createUser({
        id: userId2,
        email: email as string,
        password,
      });

      try {
        await setUserPhoneNumberCommandHandler.execute({
          unitOfWork,
          userId: user.id,
          phoneNumber: phoneNumber as string,
        });
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
        await setUserPhoneNumberCommandHandler.execute({ unitOfWork, userId: id, phoneNumber: phoneNumber as string });
      } catch (error) {
        expect(error).toBeInstanceOf(UserNotFoundError);
      }
    });
  });
});
