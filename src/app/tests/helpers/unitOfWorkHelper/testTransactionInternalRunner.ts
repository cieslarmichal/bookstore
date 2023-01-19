import { AwilixContainer } from 'awilix';
import { PostgresUnitOfWork } from '../../../libs/unitOfWork/postgresUnitOfWork';
import { TransactionCallback } from '../../../libs/unitOfWork/transactionCallback';
import { UNIT_OF_WORK_FACTORY } from '../../../libs/unitOfWork/unitOfWorkInjectionSymbols';

export class TestTransactionInternalRunner {
  public constructor(private readonly container: AwilixContainer) {}

  public async runInTestTransaction<Result>(callback: TransactionCallback<Result, PostgresUnitOfWork>): Promise<void> {
    const unitOfWorkFactory = this.container.resolve(UNIT_OF_WORK_FACTORY);

    const unitOfWork = await unitOfWorkFactory.create();

    jest.spyOn(unitOfWork, 'commit').mockImplementation(async () => {
      await unitOfWork.rollback();
    });

    await unitOfWork.runInTransaction(async () => {
      return callback(unitOfWork);
    });
  }
}
