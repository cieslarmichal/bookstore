import { updateOneDraftSchema } from './updateOneDraft';
import { SchemaType } from '../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../libs/validator/implementations/schema';

export const updateOnePayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
  draft: updateOneDraftSchema,
});

export type UpdateOnePayload = SchemaType<typeof updateOnePayloadSchema>;
