import { DeleteUserCommandHandlerPayload } from './payloads/deleteUserCommandHandlerPayload';
import { CommandHandler } from '../../../../../../common/types/commandHandler';

export type DeleteUserCommandHandler = CommandHandler<DeleteUserCommandHandlerPayload, void>;
