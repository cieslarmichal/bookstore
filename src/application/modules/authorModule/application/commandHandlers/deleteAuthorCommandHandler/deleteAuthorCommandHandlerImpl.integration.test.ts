import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { DeleteAuthorCommandHandler } from './deleteAuthorCommandHandler';
import { TestTransactionInternalRunner } from '../../../../../../common/tests/testTransactionInternalRunner';
import { postgresModuleSymbols } from '../../../../../../libs/postgres/postgresModuleSymbols';
import { Application } from '../../../../../application';
import { AuthorNotFoundError } from '../../errors/authorNotFoundError';
import { symbols } from '../../../symbols';
import { AuthorEntityTestFactory } from '../../../tests/factories/authorEntityTestFactory/authorEntityTestFactory';
import { AuthorRepositoryFactory } from '../../repositories/authorRepository/authorRepositoryFactory';

describe('DeleteAuthorCommandHandler', () => {
  let deleteAuthorCommandHandler: DeleteAuthorCommandHandler;
  let authorRepositoryFactory: AuthorRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

  const authorEntityTestFactory = new AuthorEntityTestFactory();

  beforeAll(async () => {
    const container = Application.createContainer();

    deleteAuthorCommandHandler = container.get<DeleteAuthorCommandHandler>(symbols.deleteAuthorCommandHandler);
    authorRepositoryFactory = container.get<AuthorRepositoryFactory>(symbols.authorRepositoryFactory);
    dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('deletes author from database', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const entityManager = unitOfWork.getEntityManager();
      const authorRepository = authorRepositoryFactory.create(entityManager);

      const { id, firstName, lastName } = authorEntityTestFactory.create();

      const author = await authorRepository.createAuthor({ id, firstName, lastName });

      await deleteAuthorCommandHandler.execute({ unitOfWork, authorId: author.id });

      const foundAuthor = await authorRepository.findAuthor({ id: author.id });

      expect(foundAuthor).toBeNull();
    });
  });

  it('should throw if author with given id does not exist', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const { id } = authorEntityTestFactory.create();

      try {
        await deleteAuthorCommandHandler.execute({ unitOfWork, authorId: id });
      } catch (error) {
        expect(error).toBeInstanceOf(AuthorNotFoundError);
      }
    });
  });
});
