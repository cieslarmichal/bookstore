import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const createAuthorBookDraftSchema = Schema.object({
  authorId: Schema.string(),
  bookId: Schema.string(),
});

export type CreateAuthorBookDraft = SchemaType<typeof createAuthorBookDraftSchema>;
