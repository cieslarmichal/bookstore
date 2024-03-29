import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { DeleteCategoryCommandHandler } from './deleteCategoryCommandHandler';
import { TestTransactionInternalRunner } from '../../../../../../common/tests/testTransactionInternalRunner';
import { postgresModuleSymbols } from '../../../../../../libs/postgres/postgresModuleSymbols';
import { Application } from '../../../../../application';
import { symbols } from '../../../symbols';
import { CategoryEntityTestFactory } from '../../../tests/factories/categoryEntityTestFactory/categoryEntityTestFactory';
import { CategoryNotFoundError } from '../../errors/categoryNotFoundError';
import { CategoryRepositoryFactory } from '../../repositories/categoryRepository/categoryRepositoryFactory';

describe('DeleteCategoryCommandHandler', () => {
  let deleteCategoryCommandHandler: DeleteCategoryCommandHandler;
  let categoryRepositoryFactory: CategoryRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

  const categoryEntityTestFactory = new CategoryEntityTestFactory();

  beforeAll(async () => {
    const container = Application.createContainer();

    deleteCategoryCommandHandler = container.get<DeleteCategoryCommandHandler>(symbols.deleteCategoryCommandHandler);
    categoryRepositoryFactory = container.get<CategoryRepositoryFactory>(symbols.categoryRepositoryFactory);
    dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('deletes category from database', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const entityManager = unitOfWork.getEntityManager();

      const categoryRepository = categoryRepositoryFactory.create(entityManager);

      const { id, name } = categoryEntityTestFactory.create();

      const category = await categoryRepository.createCategory({
        id,
        name,
      });

      await deleteCategoryCommandHandler.execute({ unitOfWork, categoryId: category.id });

      const foundCategory = await categoryRepository.findCategory({ id: category.id });

      expect(foundCategory).toBeNull();
    });
  });

  it('should throw if category with given id does not exist', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const { id } = categoryEntityTestFactory.create();

      try {
        await deleteCategoryCommandHandler.execute({ unitOfWork, categoryId: id });
      } catch (error) {
        expect(error).toBeInstanceOf(CategoryNotFoundError);
      }
    });
  });
});
