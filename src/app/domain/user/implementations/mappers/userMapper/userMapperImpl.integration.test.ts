import { ConfigLoader } from '../../../../../../configLoader';
import { postgresConnector } from '../../../../../libs/postgres/postgresConnector';
import { PostgresModule } from '../../../../../libs/postgres/postgresModule';
import { createDependencyInjectionContainer } from '../../../../../libs/dependencyInjection/container';
import { LoggerModule } from '../../../../../libs/logger/loggerModule';
import { UnitOfWorkModule } from '../../../../../libs/unitOfWork/unitOfWorkModule';
import { TestTransactionInternalRunner } from '../../../../../tests/helpers';
import { UserMapper } from '../../../contracts/mappers/userMapper/userMapper';
import { UserEntity } from '../../../contracts/userEntity';
import { UserEntityTestDataGenerator } from '../../../tests/userEntityTestDataGenerator/userEntityTestDataGenerator';
import { UserModule } from '../../../userModule';

describe('UserMapperImpl', () => {
  let userMapper: UserMapper;
  let userTestDataGenerator: UserEntityTestDataGenerator;
  let testTransactionRunner: TestTransactionInternalRunner;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDependencyInjectionContainer([
      PostgresModule,
      UserModule,
      LoggerModule,
      UnitOfWorkModule,
    ]);

    userMapper = container.resolve(USER_MAPPER);

    testTransactionRunner = new TestTransactionInternalRunner(container);

    userTestDataGenerator = new UserEntityTestDataGenerator();
  });

  afterEach(async () => {
    postgresConnector.closeConnection();
  });

  describe('Map user', () => {
    it('map user from entity to dto', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const { email, password, phoneNumber } = userTestDataGenerator.generateData();

        const createdUser = entityManager.create(UserEntity, {
          email,
          password,
          phoneNumber,
        });

        const savedUser = await entityManager.save(createdUser);

        const userDto = userMapper.map(savedUser);

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