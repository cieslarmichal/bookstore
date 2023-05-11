import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const deleteCartPathParametersSchema = Schema.object({
  id: Schema.string(),
});

export type DeleteCartPathParameters = SchemaType<typeof deleteCartPathParametersSchema>;

export const deleteCartResponseNoContentBodySchema = Schema.null();

export type DeleteCartResponseNoContentBody = SchemaType<typeof deleteCartResponseNoContentBodySchema>;
