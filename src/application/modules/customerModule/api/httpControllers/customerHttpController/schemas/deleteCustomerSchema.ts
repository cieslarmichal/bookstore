import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const deleteCustomerPathParametersSchema = Schema.object({
  id: Schema.string(),
});

export type DeleteCustomerPathParameters = SchemaType<typeof deleteCustomerPathParametersSchema>;

export const deleteCustomerResponseNoContentBodySchema = Schema.null();

export type DeleteCustomerResponseNoContentBody = SchemaType<typeof deleteCustomerResponseNoContentBodySchema>;
