import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { CreateAuthorCommandHandler } from './createAuthorCommandHandler';
import { TestTransactionInternalRunner } from '../../../../../../common/tests/testTransactionInternalRunner';
import { postgresModuleSymbols } from '../../../../../../libs/postgres/postgresModuleSymbols';
import { Application } from '../../../../../application';
import { symbols } from '../../../symbols';
import { AuthorEntityTestFactory } from '../../../tests/factories/authorEntityTestFactory/authorEntityTestFactory';
import { AuthorRepositoryFactory } from '../../repositories/authorRepository/authorRepositoryFactory';

describe('CreateAuthorCommandHandler', () => {
  let createAuthorCommandHandler: CreateAuthorCommandHandler;
  let authorRepositoryFactory: AuthorRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

  const authorEntityTestFactory = new AuthorEntityTestFactory();

  beforeAll(async () => {
    const container = Application.createContainer();

    createAuthorCommandHandler = container.get<CreateAuthorCommandHandler>(symbols.createAuthorCommandHandler);
    authorRepositoryFactory = container.get<AuthorRepositoryFactory>(symbols.authorRepositoryFactory);
    dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('creates author in database', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const entityManager = unitOfWork.getEntityManager();

      const authorRepository = authorRepositoryFactory.create(entityManager);

      const { firstName, lastName } = authorEntityTestFactory.create();

      const { author } = await createAuthorCommandHandler.execute({ unitOfWork, draft: { firstName, lastName } });

      const foundAuthor = await authorRepository.findAuthor({ id: author.id });

      expect(foundAuthor).not.toBeNull();
    });
  });
});
