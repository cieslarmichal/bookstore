import { UpdateBookCommandHandlerPayload } from './payloads/updateBookCommandHandlerPayload';
import { UpdateBookCommandHandlerResult } from './payloads/updateBookCommandHandlerResult';
import { CommandHandler } from '../../../../../../common/types/commandHandler';

export type UpdateBookCommandHandler = CommandHandler<UpdateBookCommandHandlerPayload, UpdateBookCommandHandlerResult>;
