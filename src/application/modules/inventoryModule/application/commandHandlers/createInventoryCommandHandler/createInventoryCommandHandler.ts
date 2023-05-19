import { CreateInventoryCommandHandlerPayload } from './payloads/createInventoryCommandHandlerPayload';
import { CreateInventoryCommandHandlerResult } from './payloads/createInventoryCommandHandlerResult';
import { CommandHandler } from '../../../../../../common/types/commandHandler';

export type CreateInventoryCommandHandler = CommandHandler<
  CreateInventoryCommandHandlerPayload,
  CreateInventoryCommandHandlerResult
>;
