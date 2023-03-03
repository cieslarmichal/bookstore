import { SchemaType } from '../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../libs/validator/implementations/schema';

export const buildPayloadSchema = Schema.object({
  page: Schema.integer().optional(),
  limit: Schema.integer().optional(),
});

export type BuildPayload = SchemaType<typeof buildPayloadSchema>;
