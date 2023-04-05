import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findCustomerPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  customerId: Schema.string().optional(),
  userId: Schema.string().optional(),
});

export type FindCustomerPayload = SchemaType<typeof findCustomerPayloadSchema>;
