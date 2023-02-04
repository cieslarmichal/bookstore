import { LoggerClient } from '../../../contracts/clients/loggerClient/loggerClient';
import { DebugPayload } from '../../../contracts/services/loggerService/debugPayload';
import { ErrorPayload } from '../../../contracts/services/loggerService/errorPayload';
import { FatalPayload } from '../../../contracts/services/loggerService/fatalPayload';
import { InfoPayload } from '../../../contracts/services/loggerService/infoPayload';
import { LoggerService } from '../../../contracts/services/loggerService/loggerService';
import { LogPayload } from '../../../contracts/services/loggerService/logPayload';
import { WarnPayload } from '../../../contracts/services/loggerService/warnPayload';

export class LoggerServiceImpl implements LoggerService {
  public constructor(private readonly loggerClient: LoggerClient) {}

  public fatal(input: FatalPayload): void {
    const { message, context } = input;

    this.loggerClient.fatal({ context: context ?? {} }, message);
  }

  public error(input: ErrorPayload): void {
    const { message, context } = input;

    this.loggerClient.error({ context: context ?? {} }, message);
  }

  public warn(input: WarnPayload): void {
    const { message, context } = input;

    this.loggerClient.warn({ context: context ?? {} }, message);
  }

  public info(input: InfoPayload): void {
    const { message, context } = input;

    this.loggerClient.info({ context: context ?? {} }, message);
  }

  public debug(input: DebugPayload): void {
    const { message, context } = input;

    this.loggerClient.debug({ context: context ?? {} }, message);
  }

  public log(input: LogPayload): void {
    const { message, context } = input;

    this.loggerClient.info({ context: context ?? {} }, message);
  }
}
