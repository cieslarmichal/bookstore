import { UpdateAddressCommandHandlerPayload } from './payloads/updateAddressCommandHandlerPayload';
import { UpdateAddressCommandHandlerResult } from './payloads/updateAddressCommandHandlerResult';
import { CommandHandler } from '../../../../../../common/types/commandHandler';

export type UpdateAddressCommandHandler = CommandHandler<
  UpdateAddressCommandHandlerPayload,
  UpdateAddressCommandHandlerResult
>;
