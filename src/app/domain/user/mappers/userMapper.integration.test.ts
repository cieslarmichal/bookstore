import { EntityManager } from 'typeorm';
import { User } from '../entities/user';
import { UserMapper } from './userMapper';
import { UserTestDataGenerator } from '../testDataGenerators/userTestDataGenerator';
import { ConfigLoader } from '../../../config';
import { createDIContainer } from '../../../shared';
import { DbModule } from '../../../shared';
import { UserModule } from '../userModule';
import { Author } from '../../author/entities/author';
import { AuthorModule } from '../../author/authorModule';
import { PostgresHelper } from '../../../../integration/helpers/postgresHelper/postgresHelper';

describe('UserMapper', () => {
  let userMapper: UserMapper;
  let userTestDataGenerator: UserTestDataGenerator;
  let entityManager: EntityManager;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([DbModule, UserModule, AuthorModule]);

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

      const { title, releaseYear, language, format, price } = userTestDataGenerator.generateData();

      const createdUser = entityManager.create(User, {
        title,
        releaseYear,
        language,
        format,
        price,
        authorId: savedAuthor.id,
      });

      const savedUser = await entityManager.save(createdUser);

      const userDto = userMapper.mapEntityToDto(savedUser);

      expect(userDto).toEqual({
        id: savedUser.id,
        createdAt: savedUser.createdAt,
        updatedAt: savedUser.updatedAt,
        title: savedUser.title,
        authorId: savedAuthor.id,
        releaseYear: savedUser.releaseYear,
        language: savedUser.language,
        format: savedUser.format,
        description: null,
        price: savedUser.price,
      });
    });

    it('maps a user with optional field from entity to dto', async () => {
      expect.assertions(1);

      const { title, releaseYear, language, format, description, price } = userTestDataGenerator.generateData();

      const createdUser = entityManager.create(User, {
        title,
        authorId: savedAuthor.id,
        releaseYear,
        language,
        format,
        description: description as string,
        price,
      });

      const savedUser = await entityManager.save(createdUser);

      const userDto = userMapper.mapEntityToDto(savedUser);

      expect(userDto).toEqual({
        id: savedUser.id,
        createdAt: savedUser.createdAt,
        updatedAt: savedUser.updatedAt,
        title: savedUser.title,
        authorId: savedAuthor.id,
        releaseYear: savedUser.releaseYear,
        language: savedUser.language,
        format: savedUser.format,
        description: savedUser.description,
        price: savedUser.price,
      });
    });
  });
});
