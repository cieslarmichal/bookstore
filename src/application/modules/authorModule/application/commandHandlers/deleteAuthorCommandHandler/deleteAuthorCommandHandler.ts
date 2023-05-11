import { DeleteAuthorCommandHandlerPayload } from './payloads/deleteAuthorCommandHandlerPayload';
import { CommandHandler } from '../../../../../../common/types/commandHandler';

export type DeleteAuthorCommandHandler = CommandHandler<DeleteAuthorCommandHandlerPayload, void>;
