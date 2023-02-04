import { EntityManager, QueryRunner } from 'typeorm';

import { LoggerService } from '../../logger/contracts/services/loggerService/loggerService';
import { TransactionCallback } from '../contracts/transactionCallback';
import { UnitOfWork } from '../contracts/unitOfWork';

export class PostgresUnitOfWork implements UnitOfWork {
  public readonly entityManager: EntityManager;

  public constructor(private readonly loggerService: LoggerService, private readonly queryRunner: QueryRunner) {
    this.entityManager = this.queryRunner.manager;
  }

  public async init(): Promise<void> {
    await this.queryRunner.startTransaction();
  }

  public async commit(): Promise<void> {
    await this.queryRunner.commitTransaction();
  }

  public async rollback(): Promise<void> {
    await this.queryRunner.rollbackTransaction();
  }

  public async cleanUp(): Promise<void> {
    await this.queryRunner.release();
  }

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

  public getEntityManager(): EntityManager {
    return this.entityManager;
  }
}
