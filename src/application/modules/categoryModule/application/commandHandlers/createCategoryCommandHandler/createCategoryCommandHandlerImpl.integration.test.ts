import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { CreateCategoryCommandHandler } from './createCategoryCommandHandler';
import { TestTransactionInternalRunner } from '../../../../../../common/tests/testTransactionInternalRunner';
import { postgresModuleSymbols } from '../../../../../../libs/postgres/postgresModuleSymbols';
import { Application } from '../../../../../application';
import { BookCategoryRepositoryFactory } from '../../../../bookCategoryModule/application/repositories/bookCategoryRepository/bookCategoryRepositoryFactory';
import { bookCategorySymbols } from '../../../../bookCategoryModule/symbols';
import { BookRepositoryFactory } from '../../../../bookModule/application/repositories/bookRepository/bookRepositoryFactory';
import { bookSymbols } from '../../../../bookModule/symbols';
import { CategoryAlreadyExistsError } from '../../errors/categoryAlreadyExistsError';
import { symbols } from '../../../symbols';
import { CategoryEntityTestFactory } from '../../../tests/factories/categoryEntityTestFactory/categoryEntityTestFactory';
import { CategoryRepositoryFactory } from '../../repositories/categoryRepository/categoryRepositoryFactory';

describe('CreateCategoryCommandHandler', () => {
  let createCategoryCommandHandler: CreateCategoryCommandHandler;
  let categoryRepositoryFactory: CategoryRepositoryFactory;
  let bookRepositoryFactory: BookRepositoryFactory;
  let bookCategoryRepositoryFactory: BookCategoryRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

  const categoryEntityTestFactory = new CategoryEntityTestFactory();

  beforeAll(async () => {
    const container = Application.createContainer();

    createCategoryCommandHandler = container.get<CreateCategoryCommandHandler>(symbols.createCategoryCommandHandler);
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

  it('creates category in database', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const entityManager = unitOfWork.getEntityManager();

      const categoryRepository = categoryRepositoryFactory.create(entityManager);

      const { name } = categoryEntityTestFactory.create();

      const { category } = await createCategoryCommandHandler.execute({
        unitOfWork,
        draft: {
          name,
        },
      });

      const foundCategory = await categoryRepository.findCategory({ id: category.id });

      expect(foundCategory).not.toBeNull();
    });
  });

  it('should not create category and throw if category with the same name exists', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const entityManager = unitOfWork.getEntityManager();

      const categoryRepository = categoryRepositoryFactory.create(entityManager);

      const { id, name } = categoryEntityTestFactory.create();

      await categoryRepository.createCategory({
        id,
        name,
      });

      try {
        await createCategoryCommandHandler.execute({
          unitOfWork,
          draft: {
            name,
          },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(CategoryAlreadyExistsError);
      }
    });
  });
});
