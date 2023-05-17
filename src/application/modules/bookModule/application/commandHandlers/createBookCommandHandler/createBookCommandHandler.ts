import { CreateBookCommandHandlerPayload } from './payloads/createBookCommandHandlerPayload';
import { CreateBookCommandHandlerResult } from './payloads/createBookCommandHandlerResult';
import { CommandHandler } from '../../../../../../common/types/commandHandler';

export type CreateBookCommandHandler = CommandHandler<CreateBookCommandHandlerPayload, CreateBookCommandHandlerResult>;
