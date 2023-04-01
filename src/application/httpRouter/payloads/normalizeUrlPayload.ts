import { Schema } from '../../../libs/validator/schema';
import { SchemaType } from '../../../libs/validator/schemaType';

export const normalizeUrlPayloadSchema = Schema.object({
  url: Schema.string(),
});

export type NormalizeUrlPayload = SchemaType<typeof normalizeUrlPayloadSchema>;
