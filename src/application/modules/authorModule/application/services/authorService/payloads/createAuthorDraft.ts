import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const createAuthorDraftSchema = Schema.object({
  firstName: Schema.string(),
  lastName: Schema.string(),
  about: Schema.string().optional(),
});

export type CreateAuthorDraft = SchemaType<typeof createAuthorDraftSchema>;
