import { asClass, asValue, AwilixContainer, Lifetime, asFunction } from 'awilix';

import { LoggerClientFactory } from './contracts/factories/loggerClientFactory/loggerClientFactory';
import { LoggerClientFactoryImpl } from './implementations/factories/loggerClientFactory/loggerClientFactoryImpl';
import { LoggerServiceImpl } from './implementations/services/loggerService/loggerServiceImpl';
import { LoggerModuleConfig } from './loggerModuleConfig';
import { loggerSymbols } from './loggerSymbols';
import { DependencyInjectionModule } from '../dependencyInjection/contracts/dependencyInjectionModule';

export class LoggerModule implements DependencyInjectionModule {
  public constructor(private readonly config: LoggerModuleConfig) {}

  public async registerSymbols(container: AwilixContainer): Promise<void> {
    container.register({
      [loggerSymbols.loggerModuleConfig]: asValue(this.config),
      [loggerSymbols.loggerClientFactory]: asClass(LoggerClientFactoryImpl, { lifetime: Lifetime.SINGLETON }),
      [loggerSymbols.loggerClient]: asFunction(() => {
        const loggerClientFactory: LoggerClientFactory = container.resolve(loggerSymbols.loggerClientFactory);

        return loggerClientFactory.create();
      }),
      [loggerSymbols.loggerService]: asClass(LoggerServiceImpl, { lifetime: Lifetime.SINGLETON }),
    });
  }
}
