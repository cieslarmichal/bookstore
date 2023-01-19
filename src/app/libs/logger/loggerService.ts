import Logger, { LogLevel } from 'bunyan';
import bunyan from 'bunyan';
import { LogContext } from './logContext';

export class LoggerService {
  private readonly instance: Logger;

  public constructor() {
    const logLevel = process.env.LOG_LEVEL as LogLevel;

    this.instance = bunyan.createLogger({ name: 'loggerService', level: logLevel });
  }

  public fatal(message: string, context?: LogContext): void {
    this.instance.fatal({ context }, message);
  }

  public error(message: string, context?: LogContext): void {
    this.instance.error({ context }, message);
  }

  public warn(message: string, context?: LogContext): void {
    this.instance.warn({ context }, message);
  }

  public info(message: string, context?: LogContext): void {
    this.instance.info({ context }, message);
  }

  public debug(message: string, context?: LogContext): void {
    this.instance.debug({ context }, message);
  }

  public log(message: string, context?: LogContext): void {
    this.instance.info({ context }, message);
  }
}
