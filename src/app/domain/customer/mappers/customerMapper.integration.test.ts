import { Customer } from '../entities/customer';
import { CustomerMapper } from './customerMapper';
import { ConfigLoader } from '../../../../configLoader';
import { createDIContainer, UnitOfWorkModule } from '../../../shared';
import { DbModule } from '../../../shared';
import { CustomerModule } from '../customerModule';
import { PostgresHelper } from '../../../../integration/helpers/postgresHelper/postgresHelper';
import { LoggerModule } from '../../../shared/logger/loggerModule';
import { CUSTOMER_MAPPER } from '../customerInjectionSymbols';
import { User } from '../../user/entities/user';
import { UserTestDataGenerator } from '../../user/testDataGenerators/userTestDataGenerator';

describe('CustomerMapper', () => {
  let customerMapper: CustomerMapper;
  let userTestDataGenerator: UserTestDataGenerator;
  let postgresHelper: PostgresHelper;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([DbModule, CustomerModule, LoggerModule, UnitOfWorkModule]);

    customerMapper = container.resolve(CUSTOMER_MAPPER);

    postgresHelper = new PostgresHelper(container);

    userTestDataGenerator = new UserTestDataGenerator();
  });

  describe('Map customer', () => {
    it('map customer from entity to dto', async () => {
      expect.assertions(1);

      await postgresHelper.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const { email, password, role } = userTestDataGenerator.generateData();

        const createdUser = entityManager.create(User, { email, password, role });

        const savedUser = await entityManager.save(createdUser);

        const createdCustomer = entityManager.create(Customer, { userId: savedUser.id });

        const savedCustomer = await entityManager.save(createdCustomer);

        const customerDto = customerMapper.mapEntityToDto(savedCustomer);

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
