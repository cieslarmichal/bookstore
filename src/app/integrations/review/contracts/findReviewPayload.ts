import { SchemaType } from '../../../common/validator/contracts/schemaType';
import { Schema } from '../../../common/validator/implementations/schema';

export const findReviewPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
});

export type FindReviewPayload = SchemaType<typeof findReviewPayloadSchema>;
