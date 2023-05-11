import { UpdateAuthorCommandHandlerPayload } from './payloads/updateAuthorCommandHandlerPayload';
import { UpdateAuthorCommandHandlerResult } from './payloads/updateAuthorCommandHandlerResult';
import { CommandHandler } from '../../../../../../common/types/commandHandler';

export type UpdateAuthorCommandHandler = CommandHandler<
  UpdateAuthorCommandHandlerPayload,
  UpdateAuthorCommandHandlerResult
>;
