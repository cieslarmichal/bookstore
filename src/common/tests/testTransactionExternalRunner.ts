/* eslint-disable @typescript-eslint/no-explicit-any */
import { DependencyInjectionContainer } from '../../libs/dependencyInjection/dependencyInjectionContainer';

import { UnitOfWorkFactory } from '../../libs/unitOfWork/contracts/factories/unitOfWorkFactory/unitOfWorkFactory';
import { UnitOfWork } from '../../libs/unitOfWork/contracts/unitOfWork';
import { TransactionCallback } from '../../libs/unitOfWork/transactionCallback';
import { unitOfWorkModuleSymbols } from '../../libs/unitOfWork/unitOfWorkModuleSymbols';

export class TestTransactionExternalRunner {
  public constructor(private readonly container: DependencyInjectionContainer) {}

  public async runInTestTransaction<Result>(callback: TransactionCallback<Result, UnitOfWork>): Promise<void> {
    const unitOfWorkFactory = this.container.get<UnitOfWorkFactory>(unitOfWorkModuleSymbols.unitOfWorkFactory);

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
