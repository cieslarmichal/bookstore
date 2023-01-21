import { ConfigLoader } from '../../../../../../configLoader';
import { postgresConnector } from '../../../../../libs/postgres/postgresConnector';
import { PostgresModule } from '../../../../../libs/postgres/postgresModule';
import { createDependencyInjectionContainer } from '../../../../../libs/dependencyInjection/container';
import { LoggerModule } from '../../../../../libs/logger/loggerModule';
import { UnitOfWorkModule } from '../../../../../libs/unitOfWork/unitOfWorkModule';
import { TestTransactionInternalRunner } from '../../../../../tests/helpers';
import { Book } from '../../../../book/contracts/book';
import { BookTestDataGenerator } from '../../../../book/tests/bookEntityTestDataGenerator/bookEntityTestDataGenerator';
import { CategoryEntity } from '../../../../category/contracts/categoryEntity';
import { CategoryTestDataGenerator } from '../../../../category/testDataGenerators/categoryTestDataGenerator';
import { BookCategoryModule } from '../../../bookCategoryModule';
import { BookCategoryEntity } from '../../../contracts/bookCategoryEntity';
import { BookCategoryMapper } from '../../../contracts/mappers/bookCategoryMapper/bookCategoryMapper';

describe('BookCategoryMapper', () => {
  let bookCategoryMapper: BookCategoryMapper;
  let categoryTestDataGenerator: CategoryTestDataGenerator;
  let bookTestDataGenerator: BookTestDataGenerator;
  let testTransactionRunner: TestTransactionInternalRunner;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDependencyInjectionContainer([
      PostgresModule,
      BookCategoryModule,
      LoggerModule,
      UnitOfWorkModule,
    ]);

    bookCategoryMapper = container.resolve(BOOK_CATEGORY_MAPPER);

    testTransactionRunner = new TestTransactionInternalRunner(container);

    categoryTestDataGenerator = new CategoryTestDataGenerator();
    bookTestDataGenerator = new BookTestDataGenerator();
  });

  afterAll(async () => {
    postgresConnector.closeConnection();
  });

  describe('Map bookCategory', () => {
    it('map bookCategory from entity to dto', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const { name } = categoryTestDataGenerator.generateData();

        const createdCategory = entityManager.create(CategoryEntity, {
          name,
        });

        const savedCategory = await entityManager.save(createdCategory);

        const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

        const createdBook = entityManager.create(Book, {
          title,
          releaseYear,
          language,
          format,
          price,
        });

        const savedBook = await entityManager.save(createdBook);

        const createdBookCategory = entityManager.create(BookCategoryEntity, {
          bookId: savedBook.id,
          categoryId: savedCategory.id,
        });

        const savedBookCategory = await entityManager.save(createdBookCategory);

        const bookCategoryDto = bookCategoryMapper.map(savedBookCategory);

        expect(bookCategoryDto).toEqual({
          id: savedBookCategory.id,
          createdAt: savedBookCategory.createdAt,
          updatedAt: savedBookCategory.updatedAt,
          bookId: savedBook.id,
          categoryId: savedCategory.id,
        });
      });
    });
  });
});