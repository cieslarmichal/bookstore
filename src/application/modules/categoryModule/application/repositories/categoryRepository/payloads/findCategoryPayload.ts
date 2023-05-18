import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findCategoryPayloadSchema = Schema.object({
  id: Schema.string().optional(),
  name: Schema.string().optional(),
});

export type FindCategoryPayload = SchemaType<typeof findCategoryPayloadSchema>;
