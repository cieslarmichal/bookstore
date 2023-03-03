import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';
import { SchemaType } from '../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../libs/validator/implementations/schema';

export const findCustomerPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  customerId: Schema.notEmptyString().optional(),
  userId: Schema.notEmptyString().optional(),
});

export type FindCustomerPayload = SchemaType<typeof findCustomerPayloadSchema>;
