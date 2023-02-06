import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';

export const deleteAuthorBookPayloadSchema = Schema.object({
  authorId: Schema.notEmptyString(),
  bookId: Schema.notEmptyString(),
});

export type DeleteAuthorBookPayload = SchemaType<typeof deleteAuthorBookPayloadSchema>;
