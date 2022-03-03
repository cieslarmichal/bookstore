import { EntityManager } from 'typeorm';
import { User } from '../entities/user';
import { UserMapper } from './userMapper';
import { UserTestDataGenerator } from '../testDataGenerators/userTestDataGenerator';
import { ConfigLoader } from '../../../config';
import { createDIContainer } from '../../../shared';
import { DbModule } from '../../../shared';
import { UserModule } from '../userModule';
import { PostgresHelper } from '../../../../integration/helpers/postgresHelper/postgresHelper';

describe('UserMapper', () => {
  let userMapper: UserMapper;
  let userTestDataGenerator: UserTestDataGenerator;
  let entityManager: EntityManager;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([DbModule, UserModule]);

    userMapper = container.resolve('userMapper');
    entityManager = container.resolve('entityManager');

    userTestDataGenerator = new UserTestDataGenerator();
  });

  afterEach(async () => {
    await PostgresHelper.removeDataFromTables();
  });

  describe('Map user', () => {
    it('map user from entity to dto', async () => {
      expect.assertions(1);

      const { email, password, role } = userTestDataGenerator.generateData();

      const createdUser = entityManager.create(User, {
        email,
        password,
        role,
      });

      const savedUser = await entityManager.save(createdUser);

      const userDto = userMapper.mapEntityToDto(savedUser);

      expect(userDto).toEqual({
        id: savedUser.id,
        createdAt: savedUser.createdAt,
        updatedAt: savedUser.updatedAt,
        email: savedUser.email,
        password: savedUser.password,
        role: savedUser.role,
      });
    });
  });
});
