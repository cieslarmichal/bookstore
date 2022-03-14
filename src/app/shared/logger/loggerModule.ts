import { LoadableModule } from '../di';
import { asClass, AwilixContainer, Lifetime } from 'awilix';
import { LOGGER_SERVICE } from './loggerInjectionSymbols';
import { LoggerService } from './services/loggerService';

export class LoggerModule extends LoadableModule {
  public override async loadDependenciesIntoDIContainer(container: AwilixContainer): Promise<void> {
    container.register({
      [LOGGER_SERVICE]: asClass(LoggerService, { lifetime: Lifetime.SINGLETON }),
    });
  }
}
