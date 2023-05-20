import { AddLineItemCommandHandlerPayload } from './payloads/addLineItemCommandHandlerPayload';
import { AddLineItemCommandHandlerResult } from './payloads/addLineItemCommandHandlerResult';
import { CommandHandler } from '../../../../../../common/types/commandHandler';

export type AddLineItemCommandHandler = CommandHandler<
  AddLineItemCommandHandlerPayload,
  AddLineItemCommandHandlerResult
>;
