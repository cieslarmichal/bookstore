import { Schema } from '../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../libs/validator/schemaType';

export const findReviewPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
});

export type FindReviewPayload = SchemaType<typeof findReviewPayloadSchema>;
