import { SchemaType } from '../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../libs/validator/implementations/schema';

export const findCategoryPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
});

export type FindCategoryPayload = SchemaType<typeof findCategoryPayloadSchema>;
