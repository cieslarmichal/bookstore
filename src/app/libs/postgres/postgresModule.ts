import { postgresConnector } from './postgresConnector';
import { asValue, AwilixContainer } from 'awilix';
import { postgresSymbols } from './postgresSymbols';
import { LoadableModule } from '../dependencyInjection/loadableModule';

export class PostgresModule extends LoadableModule {
  public override async loadDependenciesIntoContainer(container: AwilixContainer): Promise<void> {
    const postgresConnection = await postgresConnector.getConnection();

    container.register({
      [postgresSymbols.entityManager]: asValue(postgresConnection.manager),
      [postgresSymbols.connection]: asValue(postgresConnection),
    });
  }
}
