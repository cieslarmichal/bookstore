import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findOnePayloadSchema = Schema.object({
  id: Schema.string(),
});

export type FindOnePayload = SchemaType<typeof findOnePayloadSchema>;
