import { CreateAddressCommandHandlerPayload } from './payloads/createAddressCommandHandlerPayload';
import { CreateAddressCommandHandlerResult } from './payloads/createAddressCommandHandlerResult';
import { CommandHandler } from '../../../../../../common/types/commandHandler';

export type CreateAddressCommandHandler = CommandHandler<
  CreateAddressCommandHandlerPayload,
  CreateAddressCommandHandlerResult
>;
