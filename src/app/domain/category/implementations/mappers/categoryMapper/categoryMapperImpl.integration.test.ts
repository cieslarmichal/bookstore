import { ConfigLoader } from '../../../../../../configLoader';
import { postgresConnector } from '../../../../../libs/postgres/postgresConnector';
import { PostgresModule } from '../../../../../libs/postgres/postgresModule';
import { createDIContainer } from '../../../../../libs/di/container';
import { LoggerModule } from '../../../../../libs/logger/loggerModule';
import { UnitOfWorkModule } from '../../../../../libs/unitOfWork/unitOfWorkModule';
import { TestTransactionInternalRunner } from '../../../../../tests/helpers';
import { AuthorModule } from '../../../../author/authorModule';
import { CategoryModule } from '../../../categoryModule';
import { CategoryEntity } from '../../../contracts/categoryEntity';
import { CategoryMapper } from '../../../contracts/mappers/categoryMapper/categoryMapper';
import { CategoryTestDataGenerator } from '../../../tests/categoryEntityTestDataGenerator/categoryEntityTestDataGenerator';

describe('CategoryMapperImpl', () => {
  let categoryMapper: CategoryMapper;
  let categoryTestDataGenerator: CategoryTestDataGenerator;
  let testTransactionRunner: TestTransactionInternalRunner;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([
      PostgresModule,
      CategoryModule,
      AuthorModule,
      LoggerModule,
      UnitOfWorkModule,
    ]);

    categoryMapper = container.resolve(CATEGORY_MAPPER);

    testTransactionRunner = new TestTransactionInternalRunner(container);

    categoryTestDataGenerator = new CategoryTestDataGenerator();
  });

  afterAll(async () => {
    postgresConnector.closeConnection();
  });

  describe('Map category', () => {
    it('map category from entity to dto', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const { name } = categoryTestDataGenerator.generateData();

        const createdCategory = entityManager.create(CategoryEntity, {
          name,
        });

        const savedCategory = await entityManager.save(createdCategory);

        const categoryDto = categoryMapper.map(savedCategory);

        expect(categoryDto).toEqual({
          id: savedCategory.id,
          createdAt: savedCategory.createdAt,
          updatedAt: savedCategory.updatedAt,
          name: savedCategory.name,
        });
      });
    });
  });
});
