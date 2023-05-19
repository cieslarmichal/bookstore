import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const deleteCustomerCommandHandlerPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  customerId: Schema.string(),
});

export type DeleteCustomerCommandHandlerPayload = SchemaType<typeof deleteCustomerCommandHandlerPayloadSchema>;
