import { LoggerService } from '../logger';
import { TransactionCallback } from './types';

export abstract class UnitOfWork {
  public constructor(protected readonly loggerService: LoggerService) {}

  public abstract init(): Promise<void>;
  public abstract commit(): Promise<void>;
  public abstract rollback(): Promise<void>;
  public abstract cleanUp(): Promise<void>;

  public async runInTransaction<Result>(callback: TransactionCallback<Result>): Promise<Result> {
    try {
      await this.init();

      this.loggerService.debug('Initialized unit of work.');

      const result = await callback();

      await this.commit();

      this.loggerService.debug('Transaction committed.');

      return result;
    } catch (e) {
      await this.rollback();

      this.loggerService.debug('Transaction rolled back.');

      throw e;
    } finally {
      await this.cleanUp();
    }
  }
}
