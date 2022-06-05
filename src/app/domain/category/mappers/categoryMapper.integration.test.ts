import { Category } from '../entities/category';
import { CategoryMapper } from './categoryMapper';
import { CategoryTestDataGenerator } from '../testDataGenerators/categoryTestDataGenerator';
import { ConfigLoader } from '../../../../configLoader';
import { DbModule, LoggerModule, createDIContainer, UnitOfWorkModule } from '../../../shared';
import { CategoryModule } from '../categoryModule';
import { AuthorModule } from '../../author/authorModule';
import { TestTransactionRunner } from '../../../../integration/helpers/unitOfWorkHelper/testTransactionRunner';
import { CATEGORY_MAPPER } from '../categoryInjectionSymbols';

describe('CategoryMapper', () => {
  let categoryMapper: CategoryMapper;
  let categoryTestDataGenerator: CategoryTestDataGenerator;
  let testTransactionRunner: TestTransactionRunner;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([DbModule, CategoryModule, AuthorModule, LoggerModule, UnitOfWorkModule]);

    categoryMapper = container.resolve(CATEGORY_MAPPER);

    testTransactionRunner = new TestTransactionRunner(container);

    categoryTestDataGenerator = new CategoryTestDataGenerator();
  });

  describe('Map category', () => {
    it('map category from entity to dto', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

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
});
