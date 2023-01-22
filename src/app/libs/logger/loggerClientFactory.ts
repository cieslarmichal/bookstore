import { createLogger, LogLevel } from 'bunyan';

import { LoggerClient } from './loggerClient';
import { LoggerModuleConfig } from './loggerModuleConfig';

export class LoggerClientFactory {
  public constructor(private readonly loggerModuleConfig: LoggerModuleConfig) {}

  public create(): LoggerClient {
    const logLevel = this.loggerModuleConfig.logLevel as LogLevel;

    const loggerClient = createLogger({ name: 'logger', level: logLevel });

    return loggerClient;
  }
}
