import { CreateBookCategoryCommandHandlerPayload } from './payloads/createBookCategoryCommandHandlerPayload';
import { CreateBookCategoryCommandHandlerResult } from './payloads/createBookCategoryCommandHandlerResult';
import { CommandHandler } from '../../../../../../common/types/commandHandler';

export type CreateBookCategoryCommandHandler = CommandHandler<
  CreateBookCategoryCommandHandlerPayload,
  CreateBookCategoryCommandHandlerResult
>;
