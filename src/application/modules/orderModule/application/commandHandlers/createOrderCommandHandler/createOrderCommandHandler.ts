import { CreateOrderCommandHandlerPayload } from './payloads/createOrderCommandHandlerPayload';
import { CreateOrderCommandHandlerResult } from './payloads/createOrderCommandHandlerResult';
import { CommandHandler } from '../../../../../../common/types/commandHandler';

export type CreateOrderCommandHandler = CommandHandler<
  CreateOrderCommandHandlerPayload,
  CreateOrderCommandHandlerResult
>;
