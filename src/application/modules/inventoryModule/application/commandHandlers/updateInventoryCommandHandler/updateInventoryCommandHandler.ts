import { UpdateInventoryCommandHandlerPayload } from './payloads/updateInventoryCommandHandlerPayload';
import { UpdateInventoryCommandHandlerResult } from './payloads/updateInventoryCommandHandlerResult';
import { CommandHandler } from '../../../../../../common/types/commandHandler';

export type UpdateInventoryCommandHandler = CommandHandler<
  UpdateInventoryCommandHandlerPayload,
  UpdateInventoryCommandHandlerResult
>;
