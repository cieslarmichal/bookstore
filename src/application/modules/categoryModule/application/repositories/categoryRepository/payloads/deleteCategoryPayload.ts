import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const deleteCategoryPayloadSchema = Schema.object({
  id: Schema.string(),
});

export type DeleteCategoryPayload = SchemaType<typeof deleteCategoryPayloadSchema>;
