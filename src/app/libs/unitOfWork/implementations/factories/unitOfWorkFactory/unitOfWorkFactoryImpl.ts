import { DataSource } from 'typeorm';

import { LoggerService } from '../../../../logger/contracts/services/loggerService/loggerService';
import { UnitOfWorkFactory } from '../../../contracts/factories/unitOfWorkFactory/unitOfWorkFactory';
import { UnitOfWork } from '../../../contracts/unitOfWork';
import { PostgresUnitOfWork } from '../../postgresUnitOfWork';

export class UnitOfWorkFactoryImpl implements UnitOfWorkFactory {
  public constructor(private dataSource: DataSource, private readonly loggerService: LoggerService) {}

  public async create(): Promise<UnitOfWork> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();

    return new PostgresUnitOfWork(this.loggerService, queryRunner);
  }
}
