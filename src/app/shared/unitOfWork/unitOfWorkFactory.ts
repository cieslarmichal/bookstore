import { Connection } from 'typeorm';
import { LoggerService } from '../logger';

import { PostgresUnitOfWork } from './postgresUnitOfWork';

export class UnitOfWorkFactory {
  public constructor(private connection: Connection, private readonly loggerService: LoggerService) {}

  public async create(): Promise<PostgresUnitOfWork> {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();

    return new PostgresUnitOfWork(this.loggerService, queryRunner);
  }
}
