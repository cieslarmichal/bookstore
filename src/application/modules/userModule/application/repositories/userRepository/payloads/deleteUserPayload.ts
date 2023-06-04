import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const deleteUserPayloadSchema = Schema.object({
  id: Schema.string(),
});

export type DeleteUserPayload = SchemaType<typeof deleteUserPayloadSchema>;
