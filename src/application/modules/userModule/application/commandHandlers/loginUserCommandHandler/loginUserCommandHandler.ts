import { LoginUserCommandHandlerPayload } from './payloads/loginUserCommandHandlerPayload';
import { LoginUserCommandHandlerResult } from './payloads/loginUserCommandHandlerResult';
import { CommandHandler } from '../../../../../../common/types/commandHandler';

export type LoginUserCommandHandler = CommandHandler<LoginUserCommandHandlerPayload, LoginUserCommandHandlerResult>;
