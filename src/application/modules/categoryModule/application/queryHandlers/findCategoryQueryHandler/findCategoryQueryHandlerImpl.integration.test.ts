import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { FindCategoryQueryHandler } from './findCategoryQueryHandler';
import { TestTransactionInternalRunner } from '../../../../../../common/tests/testTransactionInternalRunner';
import { postgresModuleSymbols } from '../../../../../../libs/postgres/postgresModuleSymbols';
import { Application } from '../../../../../application';
import { BookCategoryRepositoryFactory } from '../../../../bookCategoryModule/application/repositories/bookCategoryRepository/bookCategoryRepositoryFactory';
import { bookCategorySymbols } from '../../../../bookCategoryModule/symbols';
import { BookRepositoryFactory } from '../../../../bookModule/application/repositories/bookRepository/bookRepositoryFactory';
import { bookSymbols } from '../../../../bookModule/symbols';
import { CategoryNotFoundError } from '../../errors/categoryNotFoundError';
import { symbols } from '../../../symbols';
import { CategoryEntityTestFactory } from '../../../tests/factories/categoryEntityTestFactory/categoryEntityTestFactory';
import { CategoryRepositoryFactory } from '../../repositories/categoryRepository/categoryRepositoryFactory';

describe('FindCategoryQueryHandler', () => {
  let findCategoryQueryHandler: FindCategoryQueryHandler;
  let categoryRepositoryFactory: CategoryRepositoryFactory;
  let bookRepositoryFactory: BookRepositoryFactory;
  let bookCategoryRepositoryFactory: BookCategoryRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

  const categoryEntityTestFactory = new CategoryEntityTestFactory();

  beforeAll(async () => {
    const container = Application.createContainer();

    findCategoryQueryHandler = container.get<FindCategoryQueryHandler>(symbols.findCategoryQueryHandler);
    categoryRepositoryFactory = container.get<CategoryRepositoryFactory>(symbols.categoryRepositoryFactory);
    bookRepositoryFactory = container.get<BookRepositoryFactory>(bookSymbols.bookRepositoryFactory);
    bookCategoryRepositoryFactory = container.get<BookCategoryRepositoryFactory>(
      bookCategorySymbols.bookCategoryRepositoryFactory,
    );
    dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('finds category by id in database', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const entityManager = unitOfWork.getEntityManager();

      const categoryRepository = categoryRepositoryFactory.create(entityManager);

      const { id, name } = categoryEntityTestFactory.create();

      const category = await categoryRepository.createCategory({
        id,
        name,
      });

      const { category: foundCategory } = await findCategoryQueryHandler.execute({
        unitOfWork,
        categoryId: category.id,
      });

      expect(foundCategory).not.toBeNull();
    });
  });

  it('should throw if category with given id does not exist in db', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const { id } = categoryEntityTestFactory.create();

      try {
        await findCategoryQueryHandler.execute({ unitOfWork, categoryId: id });
      } catch (error) {
        expect(error).toBeInstanceOf(CategoryNotFoundError);
      }
    });
  });
});
