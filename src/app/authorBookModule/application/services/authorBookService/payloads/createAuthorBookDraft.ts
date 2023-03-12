import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';

export const createAuthorBookDraftSchema = Schema.object({
  authorId: Schema.notEmptyString(),
  bookId: Schema.notEmptyString(),
});

export type CreateAuthorBookDraft = SchemaType<typeof createAuthorBookDraftSchema>;
