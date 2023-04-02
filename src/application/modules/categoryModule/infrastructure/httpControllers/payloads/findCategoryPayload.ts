import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';

export const findCategoryPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
});

export type FindCategoryPayload = SchemaType<typeof findCategoryPayloadSchema>;
