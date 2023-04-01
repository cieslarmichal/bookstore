import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findCustomerPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  customerId: Schema.notEmptyString().optional(),
  userId: Schema.notEmptyString().optional(),
});

export type FindCustomerPayload = SchemaType<typeof findCustomerPayloadSchema>;
