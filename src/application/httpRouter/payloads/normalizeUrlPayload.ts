import { Schema } from '../../libs/validator/schema.js';
import { SchemaType } from '../../libs/validator/schemaType.js';

export const normalizeUrlPayloadSchema = Schema.object({
  url: Schema.string(),
});

export type NormalizeUrlPayload = SchemaType<typeof normalizeUrlPayloadSchema>;
