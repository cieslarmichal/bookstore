import { LoggerClient } from './contracts/clients/loggerClient/loggerClient';
import { LoggerService } from './contracts/services/loggerService/loggerService';
import { LoggerClientFactoryImpl } from './implementations/factories/loggerClientFactory/loggerClientFactoryImpl';
import { LoggerServiceImpl } from './implementations/services/loggerService/loggerServiceImpl';
import { LoggerModuleConfig } from './loggerModuleConfig';
import { loggerSymbols } from './loggerSymbols';
import { DependencyInjectionModule } from '../dependencyInjection/contracts/dependencyInjectionModule';
import { DependencyInjectionContainer } from '../dependencyInjection/implementations/dependencyInjectionContainer';

export class LoggerModule implements DependencyInjectionModule {
  public constructor(private readonly config: LoggerModuleConfig) {}

  public async declareBindings(container: DependencyInjectionContainer): Promise<void> {
    container.bindToValue<LoggerModuleConfig>(loggerSymbols.loggerModuleConfig, this.config);

    container.bindToFactory<LoggerClient>(loggerSymbols.loggerClient, LoggerClientFactoryImpl);

    container.bindToConstructor<LoggerService>(loggerSymbols.loggerService, LoggerServiceImpl);
  }
}
