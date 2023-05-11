import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const createAuthorBookPayloadSchema = Schema.object({
  id: Schema.string(),
  authorId: Schema.string(),
  bookId: Schema.string(),
});

export type CreateAuthorBookPayload = SchemaType<typeof createAuthorBookPayloadSchema>;
