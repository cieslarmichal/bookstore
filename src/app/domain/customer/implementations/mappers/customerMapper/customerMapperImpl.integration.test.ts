import { ConfigLoader } from '../../../../../../configLoader';
import { dbManager } from '../../../../../libs/db/dbManager';
import { DbModule } from '../../../../../libs/db/dbModule';
import { createDIContainer } from '../../../../../libs/di/container';
import { LoggerModule } from '../../../../../libs/logger/loggerModule';
import { UnitOfWorkModule } from '../../../../../libs/unitOfWork/unitOfWorkModule';
import { TestTransactionInternalRunner } from '../../../../../tests/helpers';
import { User } from '../../../../user/entities/user';
import { UserTestDataGenerator } from '../../../../user/testDataGenerators/userTestDataGenerator';
import { CustomerEntity } from '../../../contracts/customerEntity';
import { CustomerMapper } from '../../../contracts/mappers/customerMapper/customerMapper';
import { CustomerModule } from '../../../customerModule';

describe('CustomerMapperImpl', () => {
  let customerMapper: CustomerMapper;
  let userTestDataGenerator: UserTestDataGenerator;
  let testTransactionRunner: TestTransactionInternalRunner;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([DbModule, CustomerModule, LoggerModule, UnitOfWorkModule]);

    customerMapper = container.resolve(CUSTOMER_MAPPER);

    testTransactionRunner = new TestTransactionInternalRunner(container);

    userTestDataGenerator = new UserTestDataGenerator();
  });

  afterAll(async () => {
    dbManager.closeConnection();
  });

  describe('Map customer', () => {
    it('map customer from entity to dto', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const { email, password, role } = userTestDataGenerator.generateData();

        const createdUser = entityManager.create(User, { email, password, role });

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
