import { SchemaType } from '../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../libs/validator/implementations/schema';

export const deleteCustomerPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
});

export type DeleteCustomerPayload = SchemaType<typeof deleteCustomerPayloadSchema>;
