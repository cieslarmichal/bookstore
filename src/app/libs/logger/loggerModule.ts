import { asClass, AwilixContainer, Lifetime } from 'awilix';

import { LoggerService } from './loggerService';
import { loggerSymbols } from './loggerSymbols';
import { LoadableModule } from '../dependencyInjection/loadableModule';

export class LoggerModule extends LoadableModule {
  public override async loadDependenciesIntoContainer(container: AwilixContainer): Promise<void> {
    container.register({
      [loggerSymbols.loggerService]: asClass(LoggerService, { lifetime: Lifetime.SINGLETON }),
    });
  }
}
