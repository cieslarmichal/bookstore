import { SetUserPasswordCommandHandlerPayload } from './payloads/setUserPasswordCommandHandlerPayload';
import { SetUserPasswordCommandHandlerResult } from './payloads/setUserPasswordCommandHandlerResult';
import { CommandHandler } from '../../../../../../common/types/commandHandler';

export type SetUserPasswordCommandHandler = CommandHandler<
  SetUserPasswordCommandHandlerPayload,
  SetUserPasswordCommandHandlerResult
>;
