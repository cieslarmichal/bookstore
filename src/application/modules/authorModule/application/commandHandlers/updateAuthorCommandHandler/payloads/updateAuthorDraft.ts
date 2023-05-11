import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const updateAuthorDraftSchema = Schema.object({
  about: Schema.string(),
});

export type UpdateAuthorDraft = SchemaType<typeof updateAuthorDraftSchema>;
