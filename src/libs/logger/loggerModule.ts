import { LoggerClient } from './clients/loggerClient/loggerClient';
import { LoggerClientFactoryImpl } from './factories/loggerClientFactory/loggerClientFactoryImpl';
import { LoggerModuleConfig } from './loggerModuleConfig';
import { loggerModuleSymbols } from './loggerModuleSymbols';
import { LoggerService } from './services/loggerService/loggerService';
import { LoggerServiceImpl } from './services/loggerService/loggerServiceImpl';
import { DependencyInjectionContainer } from '../dependencyInjection/dependencyInjectionContainer';
import { DependencyInjectionModule } from '../dependencyInjection/dependencyInjectionModule';

export class LoggerModule implements DependencyInjectionModule {
  public constructor(private readonly config: LoggerModuleConfig) {}

  public async declareBindings(container: DependencyInjectionContainer): Promise<void> {
    container.bindToValue<LoggerModuleConfig>(loggerModuleSymbols.loggerModuleConfig, this.config);

    container.bindToFactory<LoggerClient>(loggerModuleSymbols.loggerClient, LoggerClientFactoryImpl);

    container.bindToConstructor<LoggerService>(loggerModuleSymbols.loggerService, LoggerServiceImpl);
  }
}
