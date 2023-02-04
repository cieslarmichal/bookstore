import { TransactionCallback } from './transactionCallback';
import { LoggerService } from '../logger/contracts/services/loggerService/loggerService';

export abstract class UnitOfWork {
  public constructor(protected readonly loggerService: LoggerService) {}

  public abstract init(): Promise<void>;
  public abstract commit(): Promise<void>;
  public abstract rollback(): Promise<void>;
  public abstract cleanUp(): Promise<void>;

  public async runInTransaction<Result>(callback: TransactionCallback<Result, UnitOfWork>): Promise<Result> {
    try {
      await this.init();

      this.loggerService.debug({ message: 'Initialized unit of work.' });

      const result = await callback(this);

      await this.commit();

      this.loggerService.debug({ message: 'Transaction committed.' });

      return result;
    } catch (e) {
      await this.rollback();

      this.loggerService.debug({ message: 'Transaction rolled back.' });

      throw e;
    } finally {
      await this.cleanUp();
    }
  }
}
