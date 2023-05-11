import { DeleteAuthorBookCommandHandlerPayload } from './payloads/deleteAuthorBookCommandHandlerPayload';
import { CommandHandler } from '../../../../../../common/types/commandHandler';

export type DeleteAuthorBookCommandHandler = CommandHandler<DeleteAuthorBookCommandHandlerPayload, void>;
