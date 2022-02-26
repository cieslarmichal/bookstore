import { EntityManager, getConnection } from 'typeorm';
import { Author } from '../entities/author';
import { AuthorMapper } from './authorMapper';
import { AuthorTestDataGenerator } from '../testDataGenerators/authorTestDataGenerator';
import { ConfigLoader } from '../../../config';
import { createDIContainer } from '../../../shared';
import { DbModule } from '../../../shared';
import { ControllersModule } from '../../../controllers/controllersModule';
import { AuthorModule } from '../authorModule';
import { BookModule } from '../../book/bookModule';

describe('AuthorMapper', () => {
  let authorMapper: AuthorMapper;
  let authorTestDataGenerator: AuthorTestDataGenerator;
  let entityManager: EntityManager;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([DbModule, BookModule, AuthorModule, ControllersModule]);

    authorMapper = container.resolve('authorMapper');
    entityManager = container.resolve('entityManager');

    authorTestDataGenerator = new AuthorTestDataGenerator();
  });

  afterAll(async () => {
    await getConnection().close();
  });

  afterEach(async () => {
    const entities = getConnection().entityMetadatas;
    for (const entity of entities) {
      const repository = getConnection().getRepository(entity.name);
      await repository.query(`TRUNCATE ${entity.tableName} RESTART IDENTITY CASCADE;`);
    }
  });

  describe('Map author', () => {
    it('map author from entity to dto', async () => {
      expect.assertions(1);

      const { firstName, lastName } = authorTestDataGenerator.generateData();

      const createdAuthor = entityManager.create(Author, {
        firstName,
        lastName,
      });

      const savedAuthor = await entityManager.save(createdAuthor);

      const authorDto = authorMapper.mapEntityToDto(savedAuthor);

      expect(authorDto).toEqual({
        id: savedAuthor.id,
        createdAt: savedAuthor.createdAt,
        updatedAt: savedAuthor.updatedAt,
        firstName: savedAuthor.firstName,
        lastName: savedAuthor.lastName,
        about: null,
        books: null,
      });
    });

    it('maps a author with optional field from entity to dto', async () => {
      expect.assertions(1);

      const { firstName, lastName, about } = authorTestDataGenerator.generateData();

      const createdAuthor = entityManager.create(Author, {
        firstName,
        lastName,
        about,
      });

      const savedAuthor = await entityManager.save(createdAuthor);

      const authorDto = authorMapper.mapEntityToDto(savedAuthor);

      expect(authorDto).toEqual({
        id: savedAuthor.id,
        createdAt: savedAuthor.createdAt,
        updatedAt: savedAuthor.updatedAt,
        firstName: savedAuthor.firstName,
        lastName: savedAuthor.lastName,
        about: savedAuthor.about,
        books: null,
      });
    });
  });
});
