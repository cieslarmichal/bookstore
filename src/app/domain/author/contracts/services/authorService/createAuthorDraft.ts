import { SchemaType } from '../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../libs/validator/implementations/schema';

export const createAuthorDraftSchema = Schema.object({
  firstName: Schema.notEmptyString(),
  lastName: Schema.notEmptyString(),
  about: Schema.notEmptyString().optional(),
});

export type CreateAuthorDraft = SchemaType<typeof createAuthorDraftSchema>;
