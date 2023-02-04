import { createLogger, LogLevel } from 'bunyan';

import { LoggerClient } from '../../../contracts/clients/loggerClient/loggerClient';
import { LoggerClientFactory } from '../../../contracts/factories/loggerClientFactory/loggerClientFactory';
import { LoggerModuleConfig } from '../../../loggerModuleConfig';

export class LoggerClientFactoryImpl implements LoggerClientFactory {
  public constructor(private readonly loggerModuleConfig: LoggerModuleConfig) {}

  public create(): LoggerClient {
    const logLevel = this.loggerModuleConfig.logLevel as LogLevel;

    const loggerClient = createLogger({ name: 'logger', level: logLevel });

    return loggerClient;
  }
}
