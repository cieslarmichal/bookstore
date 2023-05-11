import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { FindAuthorQueryHandler } from './findAuthorQueryHandler';
import { TestTransactionInternalRunner } from '../../../../../../common/tests/testTransactionInternalRunner';
import { postgresModuleSymbols } from '../../../../../../libs/postgres/postgresModuleSymbols';
import { Application } from '../../../../../application';
import { AuthorNotFoundError } from '../../../infrastructure/errors/authorNotFoundError';
import { symbols } from '../../../symbols';
import { AuthorEntityTestFactory } from '../../../tests/factories/authorEntityTestFactory/authorEntityTestFactory';
import { AuthorRepositoryFactory } from '../../repositories/authorRepository/authorRepositoryFactory';

describe('FindAuthorQueryHandler', () => {
  let findAuthorQueryHandler: FindAuthorQueryHandler;
  let authorRepositoryFactory: AuthorRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

  const authorEntityTestFactory = new AuthorEntityTestFactory();

  beforeAll(async () => {
    const container = Application.createContainer();

    findAuthorQueryHandler = container.get<FindAuthorQueryHandler>(symbols.findAuthorQueryHandler);
    authorRepositoryFactory = container.get<AuthorRepositoryFactory>(symbols.authorRepositoryFactory);
    dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('finds author by id in database', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const entityManager = unitOfWork.getEntityManager();

      const authorRepository = authorRepositoryFactory.create(entityManager);

      const { id, firstName, lastName } = authorEntityTestFactory.create();

      const author = await authorRepository.createAuthor({ id, firstName, lastName });

      const { author: foundAuthor } = await findAuthorQueryHandler.execute({ unitOfWork, authorId: author.id });

      expect(foundAuthor).not.toBeNull();
    });
  });

  it('should throw if author with given id does not exist in db', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const { id } = authorEntityTestFactory.create();

      try {
        await findAuthorQueryHandler.execute({ unitOfWork, authorId: id });
      } catch (error) {
        expect(error).toBeInstanceOf(AuthorNotFoundError);
      }
    });
  });
});
