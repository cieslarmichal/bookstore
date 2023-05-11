import { DeleteAddressCommandHandlerPayload } from './payloads/deleteAddressCommandHandlerPayload';
import { CommandHandler } from '../../../../../../common/types/commandHandler';

export type DeleteAddressCommandHandler = CommandHandler<DeleteAddressCommandHandlerPayload, void>;
