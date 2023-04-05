import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const deleteUserResponseNoContentBodySchema = Schema.null();

export type DeleteUserResponseNoContentBody = SchemaType<typeof deleteUserResponseNoContentBodySchema>;
