import { EntityManager, QueryRunner } from 'typeorm';

import { TransactionCallback } from './transactionCallback';
import { UnitOfWork } from './unitOfWork';
import { LoggerService } from '../logger/services/loggerService/loggerService';

export class PostgresUnitOfWork implements UnitOfWork {
  public readonly entityManager: EntityManager;

  public constructor(private readonly loggerService: LoggerService, private readonly queryRunner: QueryRunner) {
    this.entityManager = this.queryRunner.manager;
  }

  public async init(): Promise<void> {
    await this.ensureConnection();

    await this.queryRunner.startTransaction();
  }

  public async commit(): Promise<void> {
    await this.ensureConnection();

    await this.queryRunner.commitTransaction();
  }

  public async rollback(): Promise<void> {
    await this.ensureConnection();

    await this.queryRunner.rollbackTransaction();
  }

  public async cleanUp(): Promise<void> {
    await this.ensureConnection();

    await this.queryRunner.release();
  }

  public async runInTransaction<Result>(callback: TransactionCallback<Result, UnitOfWork>): Promise<Result> {
    await this.ensureConnection();

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

  private async ensureConnection(): Promise<void> {
    if (this.queryRunner.connection.isInitialized) {
      return;
    }

    await this.queryRunner.connect();
  }
}
