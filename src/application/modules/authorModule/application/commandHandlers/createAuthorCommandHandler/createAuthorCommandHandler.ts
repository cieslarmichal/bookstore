import { CreateAuthorCommandHandlerPayload } from './payloads/createAuthorCommandHandlerPayload';
import { CreateAuthorCommandHandlerResult } from './payloads/createAuthorCommandHandlerResult';
import { CommandHandler } from '../../../../../../common/types/commandHandler';

export type CreateAuthorCommandHandler = CommandHandler<
  CreateAuthorCommandHandlerPayload,
  CreateAuthorCommandHandlerResult
>;
