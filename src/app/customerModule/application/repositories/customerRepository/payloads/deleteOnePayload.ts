import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';

export const deleteOnePayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
});

export type DeleteOnePayload = SchemaType<typeof deleteOnePayloadSchema>;
