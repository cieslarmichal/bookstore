import { User } from '../entities/user';
import { UserMapper } from './userMapper';
import { UserTestDataGenerator } from '../testDataGenerators/userTestDataGenerator';
import { ConfigLoader } from '../../../../configLoader';
import { DbModule, LoggerModule, createDIContainer, UnitOfWorkModule, dbManager } from '../../../shared';
import { UserModule } from '../userModule';
import { TestTransactionInternalRunner } from '../../../../integration/helpers/unitOfWorkHelper/testTransactionInternalRunner';
import { USER_MAPPER } from '../userInjectionSymbols';

describe('UserMapper', () => {
  let userMapper: UserMapper;
  let userTestDataGenerator: UserTestDataGenerator;
  let testTransactionRunner: TestTransactionInternalRunner;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([DbModule, UserModule, LoggerModule, UnitOfWorkModule]);

    userMapper = container.resolve(USER_MAPPER);

    testTransactionRunner = new TestTransactionInternalRunner(container);

    userTestDataGenerator = new UserTestDataGenerator();
  });

  afterEach(async () => {
    dbManager.closeConnection();
  });

  describe('Map user', () => {
    it('map user from entity to dto', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const { email, password, phoneNumber } = userTestDataGenerator.generateData();

        const createdUser = entityManager.create(User, {
          email,
          password,
          phoneNumber,
        });

        const savedUser = await entityManager.save(createdUser);

        const userDto = userMapper.mapEntityToDto(savedUser);

        expect(userDto).toEqual({
          id: savedUser.id,
          createdAt: savedUser.createdAt,
          updatedAt: savedUser.updatedAt,
          email: savedUser.email,
          phoneNumber: savedUser.phoneNumber,
          password: savedUser.password,
          role: savedUser.role,
        });
      });
    });
  });
});
