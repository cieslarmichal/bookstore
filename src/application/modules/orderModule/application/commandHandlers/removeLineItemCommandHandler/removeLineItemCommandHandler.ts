import { RemoveLineItemCommandHandlerPayload } from './payloads/removeLineItemCommandHandlerPayload';
import { RemoveLineItemCommandHandlerResult } from './payloads/removeLineItemCommandHandlerResult';
import { CommandHandler } from '../../../../../../common/types/commandHandler';

export type RemoveLineItemCommandHandler = CommandHandler<
  RemoveLineItemCommandHandlerPayload,
  RemoveLineItemCommandHandlerResult
>;
