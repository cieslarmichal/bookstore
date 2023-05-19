import { DeleteCustomerCommandHandlerPayload } from './payloads/deleteCustomerCommandHandlerPayload';
import { CommandHandler } from '../../../../../../common/types/commandHandler';

export type DeleteCustomerCommandHandler = CommandHandler<DeleteCustomerCommandHandlerPayload, void>;
