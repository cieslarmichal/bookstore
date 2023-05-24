import { CreateWhishlistEntryCommandHandlerPayload } from './payloads/createWhishlistEntryCommandHandlerPayload';
import { CreateWhishlistEntryCommandHandlerResult } from './payloads/createWhishlistEntryCommandHandlerResult';
import { CommandHandler } from '../../../../../../common/types/commandHandler';

export type CreateWhishlistEntryCommandHandler = CommandHandler<
  CreateWhishlistEntryCommandHandlerPayload,
  CreateWhishlistEntryCommandHandlerResult
>;
