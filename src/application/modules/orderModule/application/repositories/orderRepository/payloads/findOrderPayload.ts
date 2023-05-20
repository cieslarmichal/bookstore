import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findOrderPayloadSchema = Schema.object({
  id: Schema.string(),
});

export type FindOrderPayload = SchemaType<typeof findOrderPayloadSchema>;
