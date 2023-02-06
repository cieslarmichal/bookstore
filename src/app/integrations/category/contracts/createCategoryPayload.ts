import { SchemaType } from '../../../common/validator/contracts/schemaType';
import { Schema } from '../../../common/validator/implementations/schema';

export const createCategoryPayloadSchema = Schema.object({
  name: Schema.notEmptyString(),
});

export type CreateCategoryPayload = SchemaType<typeof createCategoryPayloadSchema>;
