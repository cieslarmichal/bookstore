import { Schema, SchemaType } from '@libs/validator';

export const normalizeUrlPayloadSchema = Schema.object({
  url: Schema.string(),
});

export type NormalizeUrlPayload = SchemaType<typeof normalizeUrlPayloadSchema>;
