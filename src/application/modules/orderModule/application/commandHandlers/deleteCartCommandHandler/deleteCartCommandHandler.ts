import { DeleteCartCommandHandlerPayload } from './payloads/deleteCartCommandHandlerPayload';
import { CommandHandler } from '../../../../../../common/types/commandHandler';

export type DeleteCartCommandHandler = CommandHandler<DeleteCartCommandHandlerPayload, void>;
