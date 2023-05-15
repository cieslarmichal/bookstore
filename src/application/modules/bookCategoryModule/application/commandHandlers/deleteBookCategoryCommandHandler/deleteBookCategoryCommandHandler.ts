import { DeleteBookCategoryCommandHandlerPayload } from './payloads/deleteBookCategoryCommandHandlerPayload';
import { CommandHandler } from '../../../../../../common/types/commandHandler';

export type DeleteBookCategoryCommandHandler = CommandHandler<DeleteBookCategoryCommandHandlerPayload, void>;
