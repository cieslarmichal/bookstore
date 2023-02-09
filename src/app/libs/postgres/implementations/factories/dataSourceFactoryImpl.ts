import { DataSource } from 'typeorm';

import { Inject, Injectable } from '../../../dependencyInjection/contracts/decorators';
import { DataSourceFactory } from '../../contracts/factories/dataSourceFactory';
import { PostgresModuleConfig } from '../../postgresModuleConfig';
import { postgresSymbols } from '../../postgresSymbols';

@Injectable()
export class DataSourceFactoryImpl implements DataSourceFactory {
  public constructor(
    @Inject(postgresSymbols.postgresModuleConfig)
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
