import { LoggerModuleConfig } from '../../../loggerModuleConfig';
import { LogLevel } from '../../../logLevel';

export class LoggerModuleConfigTestFactory {
  public create(input: Partial<LoggerModuleConfig> = {}): LoggerModuleConfig {
    return {
      logLevel: LogLevel.debug,
      ...input,
    };
  }
}
