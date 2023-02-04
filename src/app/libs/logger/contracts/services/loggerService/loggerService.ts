import { DebugPayload } from './debugPayload';
import { ErrorPayload } from './errorPayload';
import { FatalPayload } from './fatalPayload';
import { InfoPayload } from './infoPayload';
import { LogPayload } from './logPayload';
import { WarnPayload } from './warnPayload';

export interface LoggerService {
  fatal(input: FatalPayload): void;
  error(input: ErrorPayload): void;
  warn(input: WarnPayload): void;
  info(input: InfoPayload): void;
  debug(input: DebugPayload): void;
  log(input: LogPayload): void;
}
