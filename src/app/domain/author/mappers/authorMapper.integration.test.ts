import { EntityManager } from 'typeorm';
import { Author } from '../entities/author';
import { AuthorMapper } from './authorMapper';
import { AuthorTestDataGenerator } from '../testDataGenerators/authorTestDataGenerator';
import { ConfigLoader } from '../../../../configLoader';
import { createDIContainer } from '../../../shared';
import { DbModule } from '../../../shared';
import { AuthorModule } from '../authorModule';
import { BookModule } from '../../book/bookModule';
import { PostgresHelper } from '../../../../integration/helpers/postgresHelper/postgresHelper';

describe('AuthorMapper', () => {
  let authorMapper: AuthorMapper;
  let authorTestDataGenerator: AuthorTestDataGenerator;
  let entityManager: EntityManager;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([DbModule, BookModule, AuthorModule]);

    authorMapper = container.resolve('authorMapper');
    entityManager = container.resolve('entityManager');

    authorTestDataGenerator = new AuthorTestDataGenerator();
  });

  afterEach(async () => {
    await PostgresHelper.removeDataFromTables();
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
