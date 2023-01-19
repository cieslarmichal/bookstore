import { AwilixContainer } from 'awilix';
import { PostgresUnitOfWork } from '../../../libs/unitOfWork/postgresUnitOfWork';
import { TransactionCallback } from '../../../libs/unitOfWork/transactionCallback';
import { UNIT_OF_WORK_FACTORY } from '../../../libs/unitOfWork/unitOfWorkInjectionSymbols';

export class TestTransactionExternalRunner {
  public constructor(private readonly container: AwilixContainer) {}

  public async runInTestTransaction<Result>(callback: TransactionCallback<Result, PostgresUnitOfWork>): Promise<void> {
    const unitOfWorkFactory = this.container.resolve(UNIT_OF_WORK_FACTORY);

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
