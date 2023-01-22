import { asClass, asValue, AwilixContainer, Lifetime, asFunction } from 'awilix';

import { LoggerClientFactory } from './loggerClientFactory';
import { LoggerModuleConfig } from './loggerModuleConfig';
import { LoggerServiceImpl } from './loggerServiceImpl';
import { loggerSymbols } from './loggerSymbols';
import { Module } from '../dependencyInjection/module';

export class LoggerModule implements Module {
  public constructor(private readonly config: LoggerModuleConfig) {}

  public async registerSymbols(container: AwilixContainer): Promise<void> {
    container.register({
      [loggerSymbols.loggerModuleConfig]: asValue(this.config),
      [loggerSymbols.loggerClientFactory]: asClass(LoggerClientFactory, { lifetime: Lifetime.SINGLETON }),
      [loggerSymbols.loggerClient]: asFunction(() => {
        const loggerClientFactory: LoggerClientFactory = container.resolve(loggerSymbols.loggerClientFactory);

        return loggerClientFactory.create();
      }),
      [loggerSymbols.loggerService]: asClass(LoggerServiceImpl, { lifetime: Lifetime.SINGLETON }),
    });
  }
}
