import { asClass, asFunction, asValue, AwilixContainer, Lifetime } from 'awilix';

import { PostgresConnector } from './contracts/postgresConnector';
import { PostgresConnectorImpl } from './implementations/postgresConnectorImpl';
import { PostgresModuleConfig } from './postgresModuleConfig';
import { postgresSymbols } from './postgresSymbols';
import { DependencyInjectionModule } from '../dependencyInjection/contracts/dependencyInjectionModule';

export class PostgresModule implements DependencyInjectionModule {
  public constructor(private readonly config: PostgresModuleConfig) {}

  public async registerSymbols(container: AwilixContainer): Promise<void> {
    container.register({
      [postgresSymbols.postgresModuleConfig]: asValue(this.config),
      [postgresSymbols.postgresConnector]: asClass(PostgresConnectorImpl, { lifetime: Lifetime.SINGLETON }),
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
