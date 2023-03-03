import { SchemaType } from '../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../libs/validator/implementations/schema';

export const updateAuthorDraftSchema = Schema.object({
  about: Schema.notEmptyString(),
});

export type UpdateAuthorDraft = SchemaType<typeof updateAuthorDraftSchema>;
