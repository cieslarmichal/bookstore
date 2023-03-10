import { Schema, SchemaType } from '@libs/validator';

export const createCustomerBodyPayloadSchema = Schema.object({
  name: Schema.string(),
});

export type CreateCustomerBodyPayload = SchemaType<typeof createCustomerBodyPayloadSchema>;
