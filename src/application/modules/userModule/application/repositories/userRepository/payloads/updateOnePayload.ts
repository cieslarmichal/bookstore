import { updateOneDraftSchema } from './updateOneDraft';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const updateOnePayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
  draft: updateOneDraftSchema,
});

export type UpdateOnePayload = SchemaType<typeof updateOnePayloadSchema>;
