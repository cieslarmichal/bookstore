import { UpdateCartCommandHandlerPayload } from './payloads/updateCartCommandHandlerPayload';
import { UpdateCartCommandHandlerResult } from './payloads/updateCartCommandHandlerResult';
import { CommandHandler } from '../../../../../../common/types/commandHandler';

export type UpdateCartCommandHandler = CommandHandler<UpdateCartCommandHandlerPayload, UpdateCartCommandHandlerResult>;
