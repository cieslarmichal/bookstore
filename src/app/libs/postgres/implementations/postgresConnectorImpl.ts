import { DataSource } from 'typeorm';

import { PostgresConnector } from '../contracts/postgresConnector';
import { PostgresModuleConfig } from '../postgresModuleConfig';

export class PostgresConnectorImpl implements PostgresConnector {
  private dataSource: DataSource | null = null;

  public constructor(private readonly postgresModuleConfig: PostgresModuleConfig) {}

  public async connect(): Promise<DataSource> {
    if (this.dataSource) {
      return this.dataSource;
    }

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

    this.dataSource = await dataSource.initialize();

    return this.dataSource;
  }

  public async closeConnection(): Promise<void> {
    await this.dataSource?.destroy();

    this.dataSource = null;
  }
}
