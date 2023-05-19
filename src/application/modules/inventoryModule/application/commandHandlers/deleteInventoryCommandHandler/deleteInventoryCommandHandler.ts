import { DeleteInventoryCommandHandlerPayload } from './payloads/deleteInventoryCommandHandlerPayload';
import { CommandHandler } from '../../../../../../common/types/commandHandler';

export type DeleteInventoryCommandHandler = CommandHandler<DeleteInventoryCommandHandlerPayload, void>;
