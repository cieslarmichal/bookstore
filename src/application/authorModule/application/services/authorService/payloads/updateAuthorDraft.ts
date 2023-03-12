import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';

export const updateAuthorDraftSchema = Schema.object({
  about: Schema.notEmptyString(),
});

export type UpdateAuthorDraft = SchemaType<typeof updateAuthorDraftSchema>;
