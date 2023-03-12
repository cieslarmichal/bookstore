import { SchemaType } from '../../../../../../libs/validator/schemaType';
import { Schema } from '../../../../../../libs/validator/implementations/schema';

export const deleteOnePayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
});

export type DeleteOnePayload = SchemaType<typeof deleteOnePayloadSchema>;
