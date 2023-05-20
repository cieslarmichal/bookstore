import { CreateCartCommandHandlerPayload } from './payloads/createCartCommandHandlerPayload';
import { CreateCartCommandHandlerResult } from './payloads/createCartCommandHandlerResult';
import { CommandHandler } from '../../../../../../common/types/commandHandler';

export type CreateCartCommandHandler = CommandHandler<CreateCartCommandHandlerPayload, CreateCartCommandHandlerResult>;
