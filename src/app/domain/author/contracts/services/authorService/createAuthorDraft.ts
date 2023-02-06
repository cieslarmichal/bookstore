import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';

export const createAuthorDraftSchema = Schema.object({
  firstName: Schema.notEmptyString(),
  lastName: Schema.notEmptyString(),
  about: Schema.notEmptyString().optional(),
});

export type CreateAuthorDraft = SchemaType<typeof createAuthorDraftSchema>;