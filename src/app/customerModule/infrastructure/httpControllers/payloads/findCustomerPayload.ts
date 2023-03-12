import { Schema } from '../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../libs/validator/schemaType';

export const findCustomerPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
});

export type FindCustomerPayload = SchemaType<typeof findCustomerPayloadSchema>;
