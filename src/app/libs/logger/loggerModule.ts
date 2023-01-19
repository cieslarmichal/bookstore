import { asClass, AwilixContainer, Lifetime } from 'awilix';
import { LoadableModule } from '../dependencyInjection/loadableModule';
import { loggerSymbols } from './loggerSymbols';
import { LoggerService } from './loggerService';

export class LoggerModule extends LoadableModule {
  public override async loadDependenciesIntoContainer(container: AwilixContainer): Promise<void> {
    container.register({
      [loggerSymbols.loggerService]: asClass(LoggerService, { lifetime: Lifetime.SINGLETON }),
    });
  }
}
