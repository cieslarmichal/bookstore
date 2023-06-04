import { RegisterUserCommandHandlerPayload } from './payloads/registerUserCommandHandlerPayload';
import { RegisterUserCommandHandlerResult } from './payloads/registerUserCommandHandlerResult';
import { CommandHandler } from '../../../../../../common/types/commandHandler';

export type RegisterUserCommandHandler = CommandHandler<
  RegisterUserCommandHandlerPayload,
  RegisterUserCommandHandlerResult
>;
