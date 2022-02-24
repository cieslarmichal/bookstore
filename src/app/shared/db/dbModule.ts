import { LoadableModule } from '../di';
import { createDbConnection } from './connection';
import { asValue, AwilixContainer } from 'awilix';
import { ENTITY_MANAGER } from './dbInjectionSymbols';

export class DbModule extends LoadableModule {
  public override async loadDependenciesIntoDIContainer(container: AwilixContainer): Promise<void> {
    const dbConnection = await createDbConnection();

    container.register({
      [ENTITY_MANAGER]: asValue(dbConnection.manager),
    });
  }
}
