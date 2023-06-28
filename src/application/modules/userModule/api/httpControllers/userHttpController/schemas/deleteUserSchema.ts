import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const deleteUserPathParametersSchema = Schema.object({
  id: Schema.string(),
});

export type DeleteUserPathParameters = SchemaType<typeof deleteUserPathParametersSchema>;

export const deleteUserResponseNoContentBodySchema = Schema.null();

export type DeleteUserResponseNoContentBody = SchemaType<typeof deleteUserResponseNoContentBodySchema>;
