import { SetUserPhoneNumberCommandHandlerPayload } from './payloads/setUserPhoneNumberCommandHandlerPayload';
import { SetUserPhoneNumberCommandHandlerResult } from './payloads/setUserPhoneNumberCommandHandlerResult';
import { CommandHandler } from '../../../../../../common/types/commandHandler';

export type SetUserPhoneNumberCommandHandler = CommandHandler<
  SetUserPhoneNumberCommandHandlerPayload,
  SetUserPhoneNumberCommandHandlerResult
>;
