import { SchemaType } from '../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../libs/validator/implementations/schema';

export const createCustomerPayloadSchema = Schema.object({
  userId: Schema.notEmptyString(),
});

export type CreateCustomerPayload = SchemaType<typeof createCustomerPayloadSchema>;
