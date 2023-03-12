import { SchemaType } from '../../../../validator/schemaType';
import { Schema } from '../../../../validator/implementations/schema';

export const fetchPayloadSchema = Schema.object({
  url: Schema.notEmptyString(),
  init: Schema.any().optional(),
});

export type FetchPayload = SchemaType<typeof fetchPayloadSchema>;
