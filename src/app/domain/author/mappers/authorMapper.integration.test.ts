import { Author } from '../entities/author';
import { AuthorMapper } from './authorMapper';
import { AuthorTestDataGenerator } from '../testDataGenerators/authorTestDataGenerator';
import { ConfigLoader } from '../../../../configLoader';
import { createDIContainer, dbManager, UnitOfWorkModule } from '../../../shared';
import { DbModule } from '../../../shared';
import { AuthorModule } from '../authorModule';
import { BookModule } from '../../book/bookModule';
import { TestTransactionInternalRunner } from '../../../../integration/helpers/unitOfWorkHelper/testTransactionInternalRunner';
import { LoggerModule } from '../../../shared/logger/loggerModule';
import { AUTHOR_MAPPER } from '../authorInjectionSymbols';

describe('AuthorMapper', () => {
  let authorMapper: AuthorMapper;
  let authorTestDataGenerator: AuthorTestDataGenerator;
  let testTransactionRunner: TestTransactionInternalRunner;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([DbModule, BookModule, AuthorModule, LoggerModule, UnitOfWorkModule]);

    authorMapper = container.resolve(AUTHOR_MAPPER);

    testTransactionRunner = new TestTransactionInternalRunner(container);

    authorTestDataGenerator = new AuthorTestDataGenerator();
  });

  afterAll(async () => {
    dbManager.closeConnection();
  });

  describe('Map author', () => {
    it('map author from entity to dto', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

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
        });
      });
    });

    it('maps a author with optional field from entity to dto', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

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
        });
      });
    });
  });
});
