import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findOnePayloadSchema = Schema.object({
  id: Schema.notEmptyString().optional(),
  email: Schema.notEmptyString().optional(),
  phoneNumber: Schema.notEmptyString().optional(),
});

export type FindOnePayload = SchemaType<typeof findOnePayloadSchema>;
