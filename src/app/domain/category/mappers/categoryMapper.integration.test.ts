import { EntityManager } from 'typeorm';
import { Category } from '../entities/category';
import { CategoryMapper } from './categoryMapper';
import { CategoryTestDataGenerator } from '../testDataGenerators/categoryTestDataGenerator';
import { ConfigLoader } from '../../../../configLoader';
import { createDIContainer } from '../../../shared';
import { DbModule } from '../../../shared';
import { CategoryModule } from '../categoryModule';
import { AuthorModule } from '../../author/authorModule';
import { PostgresHelper } from '../../../../integration/helpers/postgresHelper/postgresHelper';
import { LoggerModule } from '../../../shared/logger/loggerModule';

describe('CategoryMapper', () => {
  let categoryMapper: CategoryMapper;
  let categoryTestDataGenerator: CategoryTestDataGenerator;
  let entityManager: EntityManager;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([DbModule, CategoryModule, AuthorModule, LoggerModule]);

    categoryMapper = container.resolve('categoryMapper');
    entityManager = container.resolve('entityManager');

    categoryTestDataGenerator = new CategoryTestDataGenerator();
  });

  afterEach(async () => {
    await PostgresHelper.removeDataFromTables();
  });

  describe('Map category', () => {
    it('map category from entity to dto', async () => {
      expect.assertions(1);

      const { name } = categoryTestDataGenerator.generateData();

      const createdCategory = entityManager.create(Category, {
        name,
      });

      const savedCategory = await entityManager.save(createdCategory);

      const categoryDto = categoryMapper.mapEntityToDto(savedCategory);

      expect(categoryDto).toEqual({
        id: savedCategory.id,
        createdAt: savedCategory.createdAt,
        updatedAt: savedCategory.updatedAt,
        name: savedCategory.name,
      });
    });
  });
});
