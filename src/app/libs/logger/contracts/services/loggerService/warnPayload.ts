import { LogContext } from '../../logContext';

export interface WarnPayload {
  readonly message: string;
  readonly context?: LogContext;
}
