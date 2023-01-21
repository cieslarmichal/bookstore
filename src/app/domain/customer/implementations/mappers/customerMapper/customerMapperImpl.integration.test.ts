import { ConfigLoader } from '../../../../../../configLoader';
import { postgresConnector } from '../../../../../libs/postgres/postgresConnector';
import { PostgresModule } from '../../../../../libs/postgres/postgresModule';
import { createDependencyInjectionContainer } from '../../../../../libs/dependencyInjection/container';
import { LoggerModule } from '../../../../../libs/logger/loggerModule';
import { UnitOfWorkModule } from '../../../../../libs/unitOfWork/unitOfWorkModule';
import { TestTransactionInternalRunner } from '../../../../../tests/helpers';
import { UserEntity } from '../../../../user/contracts/userEntity';
import { UserEntityTestDataGenerator } from '../../../../user/tests/userEntityTestDataGenerator/userEntityTestDataGenerator';
import { CustomerEntity } from '../../../contracts/customerEntity';
import { CustomerMapper } from '../../../contracts/mappers/customerMapper/customerMapper';
import { CustomerModule } from '../../../customerModule';

describe('CustomerMapperImpl', () => {
  let customerMapper: CustomerMapper;
  let userEntityTestFactory: UserEntityTestDataGenerator;
  let testTransactionRunner: TestTransactionInternalRunner;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDependencyInjectionContainer([
      PostgresModule,
      CustomerModule,
      LoggerModule,
      UnitOfWorkModule,
    ]);

    customerMapper = container.resolve(CUSTOMER_MAPPER);

    testTransactionRunner = new TestTransactionInternalRunner(container);

    userEntityTestFactory = new UserEntityTestDataGenerator();
  });

  afterAll(async () => {
    postgresConnector.closeConnection();
  });

  describe('Map customer', () => {
    it('map customer from entity to dto', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const { email, password, role } = userEntityTestFactory.generateData();

        const createdUser = entityManager.create(UserEntity, { email, password, role });

        const savedUser = await entityManager.save(createdUser);

        const createdCustomer = entityManager.create(CustomerEntity, { userId: savedUser.id });

        const savedCustomer = await entityManager.save(createdCustomer);

        const customerDto = customerMapper.map(savedCustomer);

        expect(customerDto).toEqual({
          id: savedCustomer.id,
          createdAt: savedCustomer.createdAt,
          updatedAt: savedCustomer.updatedAt,
          userId: savedCustomer.userId,
        });
      });
    });
  });
});
