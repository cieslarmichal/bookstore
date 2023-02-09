import { DataSource } from 'typeorm';

import { DataSourceFactory } from '../../contracts/factories/dataSourceFactory';
import { PostgresModuleConfig } from '../../postgresModuleConfig';

export class DataSourceFactoryImpl implements DataSourceFactory {
  public constructor(private readonly postgresModuleConfig: PostgresModuleConfig) {}

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
