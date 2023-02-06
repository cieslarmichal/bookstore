import { SchemaType } from '../../../common/validator/contracts/schemaType';
import { Schema } from '../../../common/validator/implementations/schema';

export const buildPayloadSchema = Schema.object({
  page: Schema.integer().optional(),
  limit: Schema.integer().optional(),
});

export type BuildPayload = SchemaType<typeof buildPayloadSchema>;
