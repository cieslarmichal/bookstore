import { CreateAuthorBookCommandHandlerPayload } from './payloads/createAuthorBookCommandHandlerPayload';
import { CreateAuthorBookCommandHandlerResult } from './payloads/createAuthorBookCommandHandlerResult';
import { CommandHandler } from '../../../../../../common/types/commandHandler';

export type CreateAuthorBookCommandHandler = CommandHandler<
  CreateAuthorBookCommandHandlerPayload,
  CreateAuthorBookCommandHandlerResult
>;
