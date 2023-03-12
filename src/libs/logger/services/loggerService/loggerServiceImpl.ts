import { LoggerService } from './loggerService';
import { DebugPayload, debugPayloadSchema } from './payloads/debugPayload';
import { ErrorPayload, errorPayloadSchema } from './payloads/errorPayload';
import { FatalPayload, fatalPayloadSchema } from './payloads/fatalPayload';
import { InfoPayload, infoPayloadSchema } from './payloads/infoPayload';
import { LogPayload, logPayloadSchema } from './payloads/logPayload';
import { WarnPayload, warnPayloadSchema } from './payloads/warnPayload';
import { Inject, Injectable } from '../../../dependencyInjection/decorators';
import { Validator } from '../../../validator/validator';
import { LoggerClient } from '../../clients/loggerClient/loggerClient';
import { loggerModuleSymbols } from '../../loggerModuleSymbols';

@Injectable()
export class LoggerServiceImpl implements LoggerService {
  public constructor(
    @Inject(loggerModuleSymbols.loggerClient)
    private readonly loggerClient: LoggerClient,
  ) {}

  public fatal(input: FatalPayload): void {
    const { message, context } = Validator.validate(fatalPayloadSchema, input);

    this.loggerClient.fatal({ context: context ?? {} }, message);
  }

  public error(input: ErrorPayload): void {
    const { message, context } = Validator.validate(errorPayloadSchema, input);

    this.loggerClient.error({ context: context ?? {} }, message);
  }

  public warn(input: WarnPayload): void {
    const { message, context } = Validator.validate(warnPayloadSchema, input);

    this.loggerClient.warn({ context: context ?? {} }, message);
  }

  public info(input: InfoPayload): void {
    const { message, context } = Validator.validate(infoPayloadSchema, input);

    this.loggerClient.info({ context: context ?? {} }, message);
  }

  public debug(input: DebugPayload): void {
    const { message, context } = Validator.validate(debugPayloadSchema, input);

    this.loggerClient.debug({ context: context ?? {} }, message);
  }

  public log(input: LogPayload): void {
    const { message, context } = Validator.validate(logPayloadSchema, input);

    this.loggerClient.info({ context: context ?? {} }, message);
  }
}
