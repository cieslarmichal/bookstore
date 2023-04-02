import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';

export const createCustomerPayloadSchema = Schema.object({
  userId: Schema.notEmptyString(),
});

export type CreateCustomerPayload = SchemaType<typeof createCustomerPayloadSchema>;
