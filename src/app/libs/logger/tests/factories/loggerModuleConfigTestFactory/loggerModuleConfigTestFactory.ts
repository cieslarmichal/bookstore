import { LogLevel } from '../../../contracts/logLevel';
import { LoggerModuleConfig } from '../../../loggerModuleConfig';

export class LoggerModuleConfigTestFactory {
  public create(): LoggerModuleConfig {
    return {
      logLevel: LogLevel.debug,
    };
  }
}
