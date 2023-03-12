import { Schema } from '../../../../../libs/validator/implementations/schema';
import { SchemaType } from '../../../../../libs/validator/schemaType';

export const findBookPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
});

export type FindBookPayload = SchemaType<typeof findBookPayloadSchema>;
