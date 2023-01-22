import { LogContext } from './logContext';
import { LoggerClient } from './loggerClient';
import { LoggerService } from './loggerService';

export class LoggerServiceImpl implements LoggerService {
  public constructor(private readonly loggerClient: LoggerClient) {}

  public fatal(message: string, context?: LogContext): void {
    this.loggerClient.fatal({ context }, message);
  }

  public error(message: string, context?: LogContext): void {
    this.loggerClient.error({ context }, message);
  }

  public warn(message: string, context?: LogContext): void {
    this.loggerClient.warn({ context }, message);
  }

  public info(message: string, context?: LogContext): void {
    this.loggerClient.info({ context }, message);
  }

  public debug(message: string, context?: LogContext): void {
    this.loggerClient.debug({ context }, message);
  }

  public log(message: string, context?: LogContext): void {
    this.loggerClient.info({ context }, message);
  }
}
