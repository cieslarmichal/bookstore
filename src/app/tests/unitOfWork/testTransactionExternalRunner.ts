/* eslint-disable @typescript-eslint/no-explicit-any */
import { AwilixContainer } from 'awilix';

import { PostgresUnitOfWork } from '../../libs/unitOfWork/postgresUnitOfWork';
import { TransactionCallback } from '../../libs/unitOfWork/transactionCallback';
import { unitOfWorkSymbols } from '../../libs/unitOfWork/unitOfWorkSymbols';
import { SpyFactory } from '../factories/spyFactory';

export class TestTransactionExternalRunner {
  public constructor(private readonly container: AwilixContainer) {}

  public async runInTestTransaction<Result>(
    spyFactory: SpyFactory,
    callback: TransactionCallback<Result, PostgresUnitOfWork>,
  ): Promise<void> {
    const unitOfWorkFactory = this.container.resolve(unitOfWorkSymbols.unitOfWorkFactory);

    const unitOfWork = await unitOfWorkFactory.create();

    spyFactory.create(unitOfWorkFactory, 'create').mockImplementation(async () => {
      return unitOfWork;
    });

    spyFactory.create(unitOfWork, 'commit').mockImplementation(async () => {
      await unitOfWork.rollback();
    });

    await unitOfWork.runInTransaction(async () => {
      spyFactory.create(unitOfWork, 'runInTransaction').mockImplementation(async (internalImplementation: any) => {
        return internalImplementation();
      });

      return callback(unitOfWork);
    });
  }
}
