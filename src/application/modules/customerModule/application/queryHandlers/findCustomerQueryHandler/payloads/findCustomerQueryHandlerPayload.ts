import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findCustomerQueryHandlerPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  customerId: Schema.string().optional(),
  userId: Schema.string().optional(),
});

export type FindCustomerQueryHandlerPayload = SchemaType<typeof findCustomerQueryHandlerPayloadSchema>;
