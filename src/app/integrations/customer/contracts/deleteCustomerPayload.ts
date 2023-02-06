import { SchemaType } from '../../../common/validator/contracts/schemaType';
import { Schema } from '../../../common/validator/implementations/schema';

export const deleteCustomerPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
});

export type DeleteCustomerPayload = SchemaType<typeof deleteCustomerPayloadSchema>;
