import { DeleteCategoryCommandHandlerPayload } from './payloads/deleteCategoryCommandHandlerPayload';
import { CommandHandler } from '../../../../../../common/types/commandHandler';

export type DeleteCategoryCommandHandler = CommandHandler<DeleteCategoryCommandHandlerPayload, void>;
