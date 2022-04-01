import { EntityManager, QueryRunner } from 'typeorm';
import { LoggerService } from '../logger';
import { UnitOfWork } from './unitOfWork';

export class PostgresUnitOfWork extends UnitOfWork {
  public readonly entityManager: EntityManager;

  public constructor(protected readonly logger: LoggerService, protected readonly queryRunner: QueryRunner) {
    super(logger);

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
}
