import { DeleteBookCommandHandlerPayload } from './payloads/deleteBookCommandHandlerPayload';
import { CommandHandler } from '../../../../../../common/types/commandHandler';

export type DeleteBookCommandHandler = CommandHandler<DeleteBookCommandHandlerPayload, void>;
