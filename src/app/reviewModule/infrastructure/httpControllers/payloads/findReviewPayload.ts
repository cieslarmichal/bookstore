import { SchemaType } from '../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../libs/validator/implementations/schema';

export const findReviewPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
});

export type FindReviewPayload = SchemaType<typeof findReviewPayloadSchema>;
