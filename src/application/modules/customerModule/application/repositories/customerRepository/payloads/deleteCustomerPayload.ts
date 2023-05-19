import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const deleteCustomerPayloadSchema = Schema.object({
  id: Schema.string(),
});

export type DeleteCustomerPayload = SchemaType<typeof deleteCustomerPayloadSchema>;
