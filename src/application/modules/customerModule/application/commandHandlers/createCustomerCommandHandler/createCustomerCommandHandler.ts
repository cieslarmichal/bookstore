import { CreateCustomerCommandHandlerPayload } from './payloads/createCustomerCommandHandlerPayload';
import { CreateCustomerCommandHandlerResult } from './payloads/createCustomerCommandHandlerResult';
import { CommandHandler } from '../../../../../../common/types/commandHandler';

export type CreateCustomerCommandHandler = CommandHandler<
  CreateCustomerCommandHandlerPayload,
  CreateCustomerCommandHandlerResult
>;
