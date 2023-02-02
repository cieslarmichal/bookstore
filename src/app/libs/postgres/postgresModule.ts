import { asClass, asFunction, asValue, AwilixContainer, Lifetime } from 'awilix';

import { PostgresConnector } from './postgresConnector';
import { PostgresModuleConfig } from './postgresModuleConfig';
import { postgresSymbols } from './postgresSymbols';
import { Module } from '../dependencyInjection/module';

export class PostgresModule implements Module {
  public constructor(private readonly config: PostgresModuleConfig) {}

  public async registerSymbols(container: AwilixContainer): Promise<void> {
    container.register({
      [postgresSymbols.postgresModuleConfig]: asValue(this.config),
      [postgresSymbols.postgresConnector]: asClass(PostgresConnector, { lifetime: Lifetime.SINGLETON }),
      [postgresSymbols.entityManager]: asFunction(async () => {
        const postgresConnector: PostgresConnector = container.resolve(postgresSymbols.postgresConnector);

        const dataSource = await postgresConnector.connect();

        return dataSource.manager;
      }),
      [postgresSymbols.dataSource]: asFunction(async () => {
        const postgresConnector: PostgresConnector = container.resolve(postgresSymbols.postgresConnector);

        const dataSource = await postgresConnector.connect();

        return dataSource;
      }),
    });
  }
}
