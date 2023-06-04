import { SetUserEmailCommandHandlerPayload } from './payloads/setUserEmailCommandHandlerPayload';
import { SetUserEmailCommandHandlerResult } from './payloads/setUserEmailCommandHandlerResult';
import { CommandHandler } from '../../../../../../common/types/commandHandler';

export type SetUserEmailCommandHandler = CommandHandler<
  SetUserEmailCommandHandlerPayload,
  SetUserEmailCommandHandlerResult
>;
