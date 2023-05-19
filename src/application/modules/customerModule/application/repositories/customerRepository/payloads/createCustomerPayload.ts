import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const createCustomerPayloadSchema = Schema.object({
  id: Schema.string(),
  userId: Schema.string(),
});

export type CreateCustomerPayload = SchemaType<typeof createCustomerPayloadSchema>;
