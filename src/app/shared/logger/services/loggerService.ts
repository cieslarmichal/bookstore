import Logger from 'bunyan';
import bunyan from 'bunyan';
import { LogContext } from './types/logContext';

class LoggerService {
  private readonly instance: Logger;

  public constructor() {
    this.instance = bunyan.createLogger({ name: 'loggerService' });
  }

  public fatal(message: string, context?: LogContext): void {
    this.instance.fatal(message, context);
  }

  public error(message: string, context?: LogContext): void {
    this.instance.error(message, context);
  }

  public warn(message: string, context?: LogContext): void {
    this.instance.warn(message, context);
  }

  public info(message: string, context?: LogContext): void {
    this.instance.info(message, context);
  }

  public debug(message: string, context?: LogContext): void {
    this.instance.debug(message, context);
  }

  public log(message: string, context?: LogContext): void {
    this.instance.info(message, context);
  }
}

export const logger = new LoggerService();
