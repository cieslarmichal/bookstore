import { DataSource } from 'typeorm';

import { PostgresUnitOfWork } from './postgresUnitOfWork';
import { LoggerService } from '../logger/contracts/services/loggerService/loggerService';

export class UnitOfWorkFactory {
  public constructor(private dataSource: DataSource, private readonly loggerService: LoggerService) {}

  public async create(): Promise<PostgresUnitOfWork> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();

    return new PostgresUnitOfWork(this.loggerService, queryRunner);
  }
}
