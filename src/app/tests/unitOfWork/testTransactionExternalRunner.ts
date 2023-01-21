import { AwilixContainer } from 'awilix';
import { PostgresUnitOfWork } from '../../libs/unitOfWork/postgresUnitOfWork';
import { TransactionCallback } from '../../libs/unitOfWork/transactionCallback';
import { unitOfWorkSymbols } from '../../libs/unitOfWork/unitOfWorkSymbols';

export class TestTransactionExternalRunner {
  public constructor(private readonly container: AwilixContainer) {}

  public async runInTestTransaction<Result>(callback: TransactionCallback<Result, PostgresUnitOfWork>): Promise<void> {
    const unitOfWorkFactory = this.container.resolve(unitOfWorkSymbols.unitOfWorkFactory);

    const unitOfWork = await unitOfWorkFactory.create();

    jest.spyOn(unitOfWorkFactory, 'create').mockImplementation(async () => {
      return unitOfWork;
    });

    jest.spyOn(unitOfWork, 'commit').mockImplementation(async () => {
      await unitOfWork.rollback();
    });

    await unitOfWork.runInTransaction(async () => {
      jest.spyOn(unitOfWork, 'runInTransaction').mockImplementation(async (internalImplementation: any) => {
        return internalImplementation();
      });

      return callback(unitOfWork);
    });
  }
}
