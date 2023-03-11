import { DataSource } from 'typeorm';

import { Inject, Injectable } from '../../../../dependencyInjection/contracts/decorators';
import { LoggerService } from '../../../../logger/contracts/services/loggerService/loggerService';
import { loggerSymbols } from '../../../../logger/loggerSymbols';
import { postgresSymbols } from '../../../../postgres/postgresSymbols';
import { UnitOfWorkFactory } from '../../../contracts/factories/unitOfWorkFactory/unitOfWorkFactory';
import { UnitOfWork } from '../../../contracts/unitOfWork';
import { PostgresUnitOfWork } from '../../postgresUnitOfWork';

@Injectable()
export class UnitOfWorkFactoryImpl implements UnitOfWorkFactory {
  public constructor(
    @Inject(postgresSymbols.dataSource)
    private dataSource: DataSource,
    @Inject(loggerSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async create(): Promise<UnitOfWork> {
    const queryRunner = this.dataSource.createQueryRunner();

    return new PostgresUnitOfWork(this.loggerService, queryRunner);
  }
}
