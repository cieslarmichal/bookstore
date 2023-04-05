import { Schema } from '../../../../validator/schema';
import { SchemaType } from '../../../../validator/schemaType';

export const fetchPayloadSchema = Schema.object({
  url: Schema.string(),
  init: Schema.any().optional(),
});

export type FetchPayload = SchemaType<typeof fetchPayloadSchema>;
