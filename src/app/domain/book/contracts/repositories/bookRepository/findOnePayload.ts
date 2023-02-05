import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';

export const findOnePayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
});

export type FindOnePayload = SchemaType<typeof findOnePayloadSchema>;
