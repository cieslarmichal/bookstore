import { Connection } from 'typeorm';

import { PostgresUnitOfWork } from './postgresUnitOfWork';
import { LoggerService } from '../logger/loggerService';

export class UnitOfWorkFactory {
  public constructor(private connection: Connection, private readonly loggerService: LoggerService) {}

  public async create(): Promise<PostgresUnitOfWork> {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();

    return new PostgresUnitOfWork(this.loggerService, queryRunner);
  }
}
