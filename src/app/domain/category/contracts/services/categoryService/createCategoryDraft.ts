import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';

export const createCategoryDraftSchema = Schema.object({
  name: Schema.notEmptyString(),
});

export type CreateCategoryDraft = SchemaType<typeof createCategoryDraftSchema>;
