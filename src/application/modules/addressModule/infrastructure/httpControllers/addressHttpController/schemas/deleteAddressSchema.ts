import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const deleteAddressPathParametersSchema = Schema.object({
  id: Schema.string(),
});

export type DeleteAddressPathParameters = SchemaType<typeof deleteAddressPathParametersSchema>;

export const deleteAddressResponseNoContentBodySchema = Schema.null();

export type DeleteAddressResponseNoContentBody = SchemaType<typeof deleteAddressResponseNoContentBodySchema>;
