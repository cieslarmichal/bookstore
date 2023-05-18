import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { FindCategoriesQueryHandler } from './findCategoriesQueryHandler';
import { TestTransactionInternalRunner } from '../../../../../../common/tests/testTransactionInternalRunner';
import { EqualFilter } from '../../../../../../common/types/filter';
import { FilterName } from '../../../../../../common/types/filterName';
import { FilterSymbol } from '../../../../../../common/types/filterSymbol';
import { postgresModuleSymbols } from '../../../../../../libs/postgres/postgresModuleSymbols';
import { Application } from '../../../../../application';
import { BookCategoryRepositoryFactory } from '../../../../bookCategoryModule/application/repositories/bookCategoryRepository/bookCategoryRepositoryFactory';
import { bookCategorySymbols } from '../../../../bookCategoryModule/symbols';
import { BookCategoryEntityTestFactory } from '../../../../bookCategoryModule/tests/factories/bookCategoryEntityTestFactory/bookCategoryEntityTestFactory';
import { BookRepositoryFactory } from '../../../../bookModule/application/repositories/bookRepository/bookRepositoryFactory';
import { bookSymbols } from '../../../../bookModule/symbols';
import { BookEntityTestFactory } from '../../../../bookModule/tests/factories/bookEntityTestFactory/bookEntityTestFactory';
import { symbols } from '../../../symbols';
import { CategoryEntityTestFactory } from '../../../tests/factories/categoryEntityTestFactory/categoryEntityTestFactory';
import { CategoryRepositoryFactory } from '../../repositories/categoryRepository/categoryRepositoryFactory';

describe('FindCategoriesQueryHandler', () => {
  let findCategoriesQueryHandler: FindCategoriesQueryHandler;
  let categoryRepositoryFactory: CategoryRepositoryFactory;
  let bookRepositoryFactory: BookRepositoryFactory;
  let bookCategoryRepositoryFactory: BookCategoryRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

  const categoryEntityTestFactory = new CategoryEntityTestFactory();
  const bookEntityTestFactory = new BookEntityTestFactory();
  const bookCategoryEntityTestFactory = new BookCategoryEntityTestFactory();

  beforeAll(async () => {
    const container = Application.createContainer();

    findCategoriesQueryHandler = container.get<FindCategoriesQueryHandler>(symbols.findCategoriesQueryHandler);
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

  describe('Find categories', () => {
    it('finds categories by condition in database', async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const { id, name } = categoryEntityTestFactory.create();

        const category = await categoryRepository.createCategory({
          id,
          name,
        });

        const equalFilterForNameField: EqualFilter = {
          fieldName: 'name',
          filterName: FilterName.equal,
          filterSymbol: FilterSymbol.equal,
          values: [name],
        };

        const { categories: foundCategories } = await findCategoriesQueryHandler.execute({
          unitOfWork,
          filters: [equalFilterForNameField],
          pagination: {
            page: 1,
            limit: 5,
          },
        });

        expect(foundCategories.length).toBe(1);
        expect(foundCategories[0]).toStrictEqual(category);
      });
    });
  });

  describe('Find categories by book id', () => {
    it('finds categories by bookId with condition in database', async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const bookCategoryRepository = bookCategoryRepositoryFactory.create(entityManager);

        const categoryEntity1 = categoryEntityTestFactory.create();

        const categoryEntity2 = categoryEntityTestFactory.create();

        const bookEntity = bookEntityTestFactory.create();

        const { id: bookCategoryId1 } = bookCategoryEntityTestFactory.create();

        const { id: bookCategoryId2 } = bookCategoryEntityTestFactory.create();

        const category1 = await categoryRepository.createCategory(categoryEntity1);

        const category2 = await categoryRepository.createCategory(categoryEntity2);

        const book = await bookRepository.createBook({
          id: bookEntity.id,
          format: bookEntity.format,
          language: bookEntity.language,
          price: bookEntity.price,
          title: bookEntity.title,
          isbn: bookEntity.isbn,
          releaseYear: bookEntity.releaseYear,
        });

        await bookCategoryRepository.createBookCategory({
          id: bookCategoryId1,
          categoryId: category1.id,
          bookId: book.id,
        });

        await bookCategoryRepository.createBookCategory({
          id: bookCategoryId2,
          categoryId: category2.id,
          bookId: book.id,
        });

        const equalFilterForNameField: EqualFilter = {
          fieldName: 'name',
          filterName: FilterName.equal,
          filterSymbol: FilterSymbol.equal,
          values: [category1.name],
        };

        const { categories } = await findCategoriesQueryHandler.execute({
          unitOfWork,
          bookId: book.id,
          filters: [equalFilterForNameField],
          pagination: {
            page: 1,
            limit: 5,
          },
        });

        expect(categories.length).toBe(1);
        expect(categories[0]).toStrictEqual(category1);
      });
    });
  });
});
