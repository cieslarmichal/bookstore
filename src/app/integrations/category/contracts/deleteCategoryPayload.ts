import { SchemaType } from '../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../libs/validator/implementations/schema';

export const deleteCategoryPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
});

export type DeleteCategoryPayload = SchemaType<typeof deleteCategoryPayloadSchema>;
