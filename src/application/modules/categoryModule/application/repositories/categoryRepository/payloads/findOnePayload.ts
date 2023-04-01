import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';

export const findOnePayloadSchema = Schema.object({
  id: Schema.notEmptyString().optional(),
  name: Schema.notEmptyString().optional(),
});

export type FindOnePayload = SchemaType<typeof findOnePayloadSchema>;
