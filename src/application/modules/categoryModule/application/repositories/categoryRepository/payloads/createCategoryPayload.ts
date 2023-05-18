import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const createCategoryPayloadSchema = Schema.object({
  id: Schema.string(),
  name: Schema.string(),
});

export type CreateCategoryPayload = SchemaType<typeof createCategoryPayloadSchema>;
