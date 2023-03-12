import { DataSource } from 'typeorm';

import { UnitOfWorkFactory } from './unitOfWorkFactory';
import { Inject, Injectable } from '../../../dependencyInjection/decorators';
import { loggerModuleSymbols } from '../../../logger/loggerModuleSymbols';
import { LoggerService } from '../../../logger/services/loggerService/loggerService';
import { postgresModuleSymbols } from '../../../postgres/postgresModuleSymbols';
import { PostgresUnitOfWork } from '../../postgresUnitOfWork';
import { UnitOfWork } from '../../unitOfWork';

@Injectable()
export class UnitOfWorkFactoryImpl implements UnitOfWorkFactory {
  public constructor(
    @Inject(postgresModuleSymbols.dataSource)
    private dataSource: DataSource,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async create(): Promise<UnitOfWork> {
    const queryRunner = this.dataSource.createQueryRunner();

    return new PostgresUnitOfWork(this.loggerService, queryRunner);
  }
}
