import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const deleteAuthorBookPayloadSchema = Schema.object({
  id: Schema.string(),
});

export type DeleteAuthorBookPayload = SchemaType<typeof deleteAuthorBookPayloadSchema>;
