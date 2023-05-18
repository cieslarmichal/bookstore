import { CreateCategoryCommandHandlerPayload } from './payloads/createCategoryCommandHandlerPayload';
import { CreateCategoryCommandHandlerResult } from './payloads/createCategoryCommandHandlerResult';
import { CommandHandler } from '../../../../../../common/types/commandHandler';

export type CreateCategoryCommandHandler = CommandHandler<
  CreateCategoryCommandHandlerPayload,
  CreateCategoryCommandHandlerResult
>;
