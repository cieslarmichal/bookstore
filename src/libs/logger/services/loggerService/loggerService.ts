import { DebugPayload } from './payloads/debugPayload';
import { ErrorPayload } from './payloads/errorPayload';
import { FatalPayload } from './payloads/fatalPayload';
import { InfoPayload } from './payloads/infoPayload';
import { LogPayload } from './payloads/logPayload';
import { WarnPayload } from './payloads/warnPayload';

export interface LoggerService {
  fatal(input: FatalPayload): void;
  error(input: ErrorPayload): void;
  warn(input: WarnPayload): void;
  info(input: InfoPayload): void;
  debug(input: DebugPayload): void;
  log(input: LogPayload): void;
}
