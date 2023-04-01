import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const deleteReviewPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  reviewId: Schema.notEmptyString(),
});

export type DeleteReviewPayload = SchemaType<typeof deleteReviewPayloadSchema>;
