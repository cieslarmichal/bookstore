import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';

export const updateAuthorDraftSchema = Schema.object({
  about: Schema.notEmptyString(),
});

export type UpdateAuthorDraft = SchemaType<typeof updateAuthorDraftSchema>;
