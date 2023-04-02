import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';

export const createCategoryPayloadSchema = Schema.object({
  name: Schema.notEmptyString(),
});

export type CreateCategoryPayload = SchemaType<typeof createCategoryPayloadSchema>;
