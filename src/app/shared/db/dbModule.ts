import { LoadableModule } from '../di';
import { dbManager } from './dbManager';
import { asValue, AwilixContainer } from 'awilix';
import { ENTITY_MANAGER } from './dbInjectionSymbols';

export class DbModule extends LoadableModule {
  public override async loadDependenciesIntoDIContainer(container: AwilixContainer): Promise<void> {
    const dbConnection = await dbManager.getConnection();

    container.register({
      [ENTITY_MANAGER]: asValue(dbConnection.manager),
    });
  }
}
