import { Schema } from '../../../libs/validator/schema';
import { SchemaType } from '../../../libs/validator/schemaType';

export const buildPayloadSchema = Schema.object({
  page: Schema.integer().optional(),
  limit: Schema.integer().optional(),
});

export type BuildPayload = SchemaType<typeof buildPayloadSchema>;
