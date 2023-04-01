import { Schema } from '../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../libs/validator/schemaType';

export const deleteAuthorBookPayloadSchema = Schema.object({
  authorId: Schema.notEmptyString(),
  bookId: Schema.notEmptyString(),
});

export type DeleteAuthorBookPayload = SchemaType<typeof deleteAuthorBookPayloadSchema>;
