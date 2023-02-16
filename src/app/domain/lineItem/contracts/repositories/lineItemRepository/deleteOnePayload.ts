import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';

export const deleteOnePayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
});

export type DeleteOnePayload = SchemaType<typeof deleteOnePayloadSchema>;
