import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export const findCustomerPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  customerId: Schema.notEmptyString().optional(),
  userId: Schema.notEmptyString().optional(),
});

export type FindCustomerPayload = SchemaType<typeof findCustomerPayloadSchema>;
