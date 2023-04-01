import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const createCategoryDraftSchema = Schema.object({
  name: Schema.notEmptyString(),
});

export type CreateCategoryDraft = SchemaType<typeof createCategoryDraftSchema>;
