import { LoggerModuleConfig } from './loggerModuleConfig';
import { LogLevel } from './logLevel';

export class LoggerModuleConfigTestFactory {
  public create(): LoggerModuleConfig {
    return {
      logLevel: LogLevel.debug,
    };
  }
}
