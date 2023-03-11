import { SchemaType } from '../../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../../libs/validator/implementations/schema';

export const createCategoryDraftSchema = Schema.object({
  name: Schema.notEmptyString(),
});

export type CreateCategoryDraft = SchemaType<typeof createCategoryDraftSchema>;
