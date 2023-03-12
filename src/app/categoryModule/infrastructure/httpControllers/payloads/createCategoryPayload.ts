import { Schema } from '../../../../../libs/validator/implementations/schema';
import { SchemaType } from '../../../../../libs/validator/schemaType';

export const createCategoryPayloadSchema = Schema.object({
  name: Schema.notEmptyString(),
});

export type CreateCategoryPayload = SchemaType<typeof createCategoryPayloadSchema>;
