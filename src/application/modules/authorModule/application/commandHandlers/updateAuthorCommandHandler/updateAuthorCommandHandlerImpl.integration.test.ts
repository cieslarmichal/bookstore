import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { UpdateAuthorCommandHandler } from './updateAuthorCommandHandler';
import { TestTransactionInternalRunner } from '../../../../../../common/tests/testTransactionInternalRunner';
import { postgresModuleSymbols } from '../../../../../../libs/postgres/postgresModuleSymbols';
import { Application } from '../../../../../application';
import { symbols } from '../../../symbols';
import { AuthorEntityTestFactory } from '../../../tests/factories/authorEntityTestFactory/authorEntityTestFactory';
import { AuthorNotFoundError } from '../../errors/authorNotFoundError';
import { AuthorRepositoryFactory } from '../../repositories/authorRepository/authorRepositoryFactory';

describe('UpdateAuthorCommandHandler', () => {
  let updateAuthorCommandHandler: UpdateAuthorCommandHandler;
  let authorRepositoryFactory: AuthorRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

  const authorEntityTestFactory = new AuthorEntityTestFactory();

  beforeAll(async () => {
    const container = Application.createContainer();

    updateAuthorCommandHandler = container.get<UpdateAuthorCommandHandler>(symbols.updateAuthorCommandHandler);
    authorRepositoryFactory = container.get<AuthorRepositoryFactory>(symbols.authorRepositoryFactory);
    dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('updates author in database', async () => {
    expect.assertions(2);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const entityManager = unitOfWork.getEntityManager();

      const authorRepository = authorRepositoryFactory.create(entityManager);

      const { id, firstName, lastName, about } = authorEntityTestFactory.create();

      const author = await authorRepository.createAuthor({ id, firstName, lastName });

      const { author: updatedAuthor } = await updateAuthorCommandHandler.execute({
        unitOfWork,
        authorId: author.id,
        draft: { about: about as string },
      });

      expect(updatedAuthor).not.toBeNull();
      expect(updatedAuthor.about).toBe(about);
    });
  });

  it('should not update author and throw if author with given id does not exist', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const { id, about } = authorEntityTestFactory.create();

      try {
        await updateAuthorCommandHandler.execute({ unitOfWork, authorId: id, draft: { about: about as string } });
      } catch (error) {
        expect(error).toBeInstanceOf(AuthorNotFoundError);
      }
    });
  });
});
