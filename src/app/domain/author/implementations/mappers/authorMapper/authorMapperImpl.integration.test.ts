import { ConfigLoader } from '../../../../../../configLoader';
import { postgresConnector } from '../../../../../libs/postgres/postgresConnector';
import { PostgresModule } from '../../../../../libs/postgres/postgresModule';
import { createDependencyInjectionContainer } from '../../../../../libs/dependencyInjection/container';
import { LoggerModule } from '../../../../../libs/logger/loggerModule';
import { UnitOfWorkModule } from '../../../../../libs/unitOfWork/unitOfWorkModule';
import { TestTransactionInternalRunner } from '../../../../../tests/helpers';
import { BookModule } from '../../../../book/bookModule';
import { AuthorModule } from '../../../authorModule';
import { authorSymbols } from '../../../authorSymbols';
import { AuthorEntity } from '../../../contracts/authorEntity';
import { AuthorMapper } from '../../../contracts/mappers/authorMapper/authorMapper';
import { AuthorEntityTestDataGenerator } from '../../../tests/authorEntityTestDataGenerator/authorEntityTestDataGenerator';

describe('AuthorMapperImpl', () => {
  let authorMapper: AuthorMapper;
  let testTransactionRunner: TestTransactionInternalRunner;

  const authorEntityTestDataGenerator = new AuthorEntityTestDataGenerator();

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDependencyInjectionContainer([
      PostgresModule,
      BookModule,
      AuthorModule,
      LoggerModule,
      UnitOfWorkModule,
    ]);

    authorMapper = container.resolve(authorSymbols.authorMapper);

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    postgresConnector.closeConnection();
  });

  describe('Map author', () => {
    it('map author from entity to dto', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const { firstName, lastName } = authorEntityTestDataGenerator.generateData();

        const createdAuthor = entityManager.create(AuthorEntity, {
          firstName,
          lastName,
        });

        const savedAuthor = await entityManager.save(createdAuthor);

        const authorDto = authorMapper.map(savedAuthor);

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

        const { firstName, lastName, about } = authorEntityTestDataGenerator.generateData();

        const createdAuthor = entityManager.create(AuthorEntity, {
          firstName,
          lastName,
          about,
        });

        const savedAuthor = await entityManager.save(createdAuthor);

        const authorDto = authorMapper.map(savedAuthor);

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
