import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { FindAuthorsQueryHandler } from './findAuthorsQueryHandler';
import { TestTransactionInternalRunner } from '../../../../../../common/tests/testTransactionInternalRunner';
import { EqualFilter } from '../../../../../../common/types/filter';
import { FilterName } from '../../../../../../common/types/filterName';
import { FilterSymbol } from '../../../../../../common/types/filterSymbol';
import { postgresModuleSymbols } from '../../../../../../libs/postgres/postgresModuleSymbols';
import { Application } from '../../../../../application';
import { AuthorBookRepositoryFactory } from '../../../../authorBookModule/application/repositories/authorBookRepository/authorBookRepositoryFactory';
import { authorBookSymbols } from '../../../../authorBookModule/symbols';
import { BookRepositoryFactory } from '../../../../bookModule/application/repositories/bookRepository/bookRepositoryFactory';
import { bookSymbols } from '../../../../bookModule/symbols';
import { symbols } from '../../../symbols';
import { AuthorEntityTestFactory } from '../../../tests/factories/authorEntityTestFactory/authorEntityTestFactory';
import { AuthorRepositoryFactory } from '../../repositories/authorRepository/authorRepositoryFactory';

describe('FindAuthorsQueryHandler', () => {
  let findAuthorsQueryHandler: FindAuthorsQueryHandler;
  let authorRepositoryFactory: AuthorRepositoryFactory;
  let bookRepositoryFactory: BookRepositoryFactory;
  let authorBookRepositoryFactory: AuthorBookRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

  const authorEntityTestFactory = new AuthorEntityTestFactory();

  beforeAll(async () => {
    const container = Application.createContainer();

    findAuthorsQueryHandler = container.get<FindAuthorsQueryHandler>(symbols.findAuthorsQueryHandler);
    authorRepositoryFactory = container.get<AuthorRepositoryFactory>(symbols.authorRepositoryFactory);
    bookRepositoryFactory = container.get<BookRepositoryFactory>(bookSymbols.bookRepositoryFactory);
    authorBookRepositoryFactory = container.get<AuthorBookRepositoryFactory>(
      authorBookSymbols.authorBookRepositoryFactory,
    );
    dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('finds authors by one condition in database', async () => {
    expect.assertions(2);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const entityManager = unitOfWork.getEntityManager();

      const authorRepository = authorRepositoryFactory.create(entityManager);

      const { id: id1, firstName: firstName1, lastName: lastName1 } = authorEntityTestFactory.create();

      const { id: id2, firstName: firstName2, lastName: lastName2 } = authorEntityTestFactory.create();

      const author = await authorRepository.createAuthor({ id: id1, firstName: firstName1, lastName: lastName1 });

      await authorRepository.createAuthor({ id: id2, firstName: firstName2, lastName: lastName2 });

      const equalFilterForFirstNameField: EqualFilter = {
        fieldName: 'firstName',
        filterName: FilterName.equal,
        filterSymbol: FilterSymbol.equal,
        values: [firstName1],
      };

      const { authors: foundAuthors } = await findAuthorsQueryHandler.execute({
        unitOfWork,
        filters: [equalFilterForFirstNameField],
        pagination: {
          page: 1,
          limit: 5,
        },
      });

      expect(foundAuthors.length).toBe(1);
      expect(foundAuthors[0]).toStrictEqual(author);
    });
  });

  it('finds authors by two conditions in database', async () => {
    expect.assertions(2);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const entityManager = unitOfWork.getEntityManager();

      const authorRepository = authorRepositoryFactory.create(entityManager);

      const { id: id1, firstName: firstName1, lastName: lastName1 } = authorEntityTestFactory.create();

      const { id: id2, firstName: firstName2, lastName: lastName2 } = authorEntityTestFactory.create();

      const author = await authorRepository.createAuthor({ id: id1, firstName: firstName1, lastName: lastName1 });

      await authorRepository.createAuthor({ id: id2, firstName: firstName2, lastName: lastName2 });

      const equalFilterForFirstNameField: EqualFilter = {
        fieldName: 'firstName',
        filterName: FilterName.equal,
        filterSymbol: FilterSymbol.equal,
        values: [firstName1],
      };

      const equalFilterForLastNameField: EqualFilter = {
        fieldName: 'lastName',
        filterName: FilterName.equal,
        filterSymbol: FilterSymbol.equal,
        values: [lastName1],
      };

      const { authors: foundAuthors } = await findAuthorsQueryHandler.execute({
        unitOfWork,
        filters: [equalFilterForFirstNameField, equalFilterForLastNameField],
        pagination: {
          page: 1,
          limit: 5,
        },
      });

      expect(foundAuthors.length).toBe(1);
      expect(foundAuthors[0]).toStrictEqual(author);
    });
  });

  it('finds authors in database limited by pagination', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const entityManager = unitOfWork.getEntityManager();

      const authorRepository = authorRepositoryFactory.create(entityManager);

      const { id: id1, firstName, lastName: lastName1 } = authorEntityTestFactory.create();

      const { id: id2, lastName: lastName2 } = authorEntityTestFactory.create();

      const { id: id3, lastName: lastName3 } = authorEntityTestFactory.create();

      await authorRepository.createAuthor({ id: id1, firstName, lastName: lastName1 });

      await authorRepository.createAuthor({ id: id2, firstName, lastName: lastName2 });

      await authorRepository.createAuthor({ id: id3, firstName, lastName: lastName3 });

      const equalFilterForFirstNameField: EqualFilter = {
        fieldName: 'firstName',
        filterName: FilterName.equal,
        filterSymbol: FilterSymbol.equal,
        values: [firstName],
      };

      const { authors: foundAuthors } = await findAuthorsQueryHandler.execute({
        unitOfWork,
        filters: [equalFilterForFirstNameField],
        pagination: {
          page: 1,
          limit: 2,
        },
      });

      expect(foundAuthors.length).toBe(2);
    });
  });
});
