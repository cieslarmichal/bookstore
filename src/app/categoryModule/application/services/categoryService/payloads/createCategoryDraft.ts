import { Schema } from '../../../../../../libs/validator/implementations/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';

export const createCategoryDraftSchema = Schema.object({
  name: Schema.notEmptyString(),
});

export type CreateCategoryDraft = SchemaType<typeof createCategoryDraftSchema>;
