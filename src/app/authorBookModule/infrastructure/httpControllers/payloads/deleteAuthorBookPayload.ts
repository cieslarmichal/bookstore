import { SchemaType } from '../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../libs/validator/implementations/schema';

export const deleteAuthorBookPayloadSchema = Schema.object({
  authorId: Schema.notEmptyString(),
  bookId: Schema.notEmptyString(),
});

export type DeleteAuthorBookPayload = SchemaType<typeof deleteAuthorBookPayloadSchema>;
