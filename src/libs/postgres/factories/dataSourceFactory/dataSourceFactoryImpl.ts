import { DataSource } from 'typeorm';

import { DataSourceFactory } from './dataSourceFactory';
import { Inject, Injectable } from '../../../dependencyInjection/decorators';
import { PostgresModuleConfig } from '../../postgresModuleConfig';
import { postgresModuleSymbols } from '../../postgresModuleSymbols';

@Injectable()
export class DataSourceFactoryImpl implements DataSourceFactory {
  public constructor(
    @Inject(postgresModuleSymbols.postgresModuleConfig)
    private readonly postgresModuleConfig: PostgresModuleConfig,
  ) {}

  public create(): DataSource {
    const { databaseHost, databasePort, databaseUser, databasePassword, databaseName, entities } =
      this.postgresModuleConfig;

    const dataSource = new DataSource({
      type: 'postgres',
      host: databaseHost,
      port: databasePort,
      username: databaseUser,
      password: databasePassword,
      database: databaseName,
      entities: entities,
      synchronize: true,
    });

    return dataSource;
  }
}
