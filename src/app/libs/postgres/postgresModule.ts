import { asValue, AwilixContainer } from 'awilix';

import { postgresConnector } from './postgresConnector';
import { postgresSymbols } from './postgresSymbols';
import { Module } from '../dependencyInjection/module';

export class PostgresModule extends Module {
  public constructor(private readonly config: PostgresConfig) {}

  public override async registerSymbols(container: AwilixContainer): Promise<void> {
    const postgresConnection = await postgresConnector.getConnection();

    container.register({
      [postgresSymbols.entityManager]: asValue(postgresConnection.manager),
      [postgresSymbols.connection]: asValue(postgresConnection),
    });
  }
}
