import { LoadableModule } from '../di';
import { asValue, AwilixContainer } from 'awilix';
import { LOGGER_SERVICE } from './loggerInjectionSymbols';
import { logger } from './services/loggerService';

export class LoggerModule extends LoadableModule {
  public override async loadDependenciesIntoDIContainer(container: AwilixContainer): Promise<void> {
    container.register({
      [LOGGER_SERVICE]: asValue(logger),
    });
  }
}
