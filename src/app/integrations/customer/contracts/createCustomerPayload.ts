import { SchemaType } from '../../../common/validator/contracts/schemaType';
import { Schema } from '../../../common/validator/implementations/schema';

export const createCustomerPayloadSchema = Schema.object({
  userId: Schema.notEmptyString(),
});

export type CreateCustomerPayload = SchemaType<typeof createCustomerPayloadSchema>;
