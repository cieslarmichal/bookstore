import { SchemaType } from '../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../libs/validator/implementations/schema';

export const createCategoryPayloadSchema = Schema.object({
  name: Schema.notEmptyString(),
});

export type CreateCategoryPayload = SchemaType<typeof createCategoryPayloadSchema>;
