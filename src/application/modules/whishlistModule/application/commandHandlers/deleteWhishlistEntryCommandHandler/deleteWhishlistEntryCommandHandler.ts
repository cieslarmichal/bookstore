import { DeleteWhishlistEntryCommandHandlerPayload } from './payloads/deleteWhishlistEntryCommandHandlerPayload';
import { CommandHandler } from '../../../../../../common/types/commandHandler';

export type DeleteWhishlistEntryCommandHandler = CommandHandler<DeleteWhishlistEntryCommandHandlerPayload, void>;
