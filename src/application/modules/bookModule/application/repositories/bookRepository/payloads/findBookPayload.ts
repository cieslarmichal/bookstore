import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findBookPayloadSchema = Schema.object({
  id: Schema.string(),
});

export type FindBookPayload = SchemaType<typeof findBookPayloadSchema>;
