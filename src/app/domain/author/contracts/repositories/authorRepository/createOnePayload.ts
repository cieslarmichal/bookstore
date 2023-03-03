import { SchemaType } from '../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../libs/validator/implementations/schema';

export const createOnePayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
  firstName: Schema.notEmptyString(),
  lastName: Schema.notEmptyString(),
  about: Schema.notEmptyString().optional(),
});

export type CreateOnePayload = SchemaType<typeof createOnePayloadSchema>;
