import { LogLevel } from '../../../contracts/logLevel';
import { LoggerModuleConfig } from '../../../loggerModuleConfig';

export class LoggerModuleConfigTestFactory {
  public create(input: Partial<LoggerModuleConfig> = {}): LoggerModuleConfig {
    return {
      logLevel: LogLevel.debug,
      ...input,
    };
  }
}
