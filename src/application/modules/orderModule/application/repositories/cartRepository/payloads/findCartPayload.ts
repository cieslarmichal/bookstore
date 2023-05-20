import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findCartPayloadSchema = Schema.object({
  id: Schema.string(),
});

export type FindCartPayload = SchemaType<typeof findCartPayloadSchema>;
