import { createLogger, LogLevel } from 'bunyan';

import { LoggerClientFactory } from './loggerClientFactory';
import { Inject, Injectable } from '../../../dependencyInjection/decorators';
import { LoggerClient } from '../../clients/loggerClient/loggerClient';
import { LoggerModuleConfig } from '../../loggerModuleConfig';
import { loggerModuleSymbols } from '../../loggerModuleSymbols';

@Injectable()
export class LoggerClientFactoryImpl implements LoggerClientFactory {
  public constructor(
    @Inject(loggerModuleSymbols.loggerModuleConfig)
    private readonly loggerModuleConfig: LoggerModuleConfig,
  ) {}

  public create(): LoggerClient {
    const logLevel = this.loggerModuleConfig.logLevel as LogLevel;

    const loggerClient = createLogger({ name: 'logger', level: logLevel });

    return loggerClient;
  }
}
