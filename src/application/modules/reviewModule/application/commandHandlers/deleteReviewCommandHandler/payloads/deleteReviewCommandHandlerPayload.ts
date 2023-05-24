import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const deleteReviewCommandHandlerPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  reviewId: Schema.string(),
});

export type DeleteReviewCommandHandlerPayload = SchemaType<typeof deleteReviewCommandHandlerPayloadSchema>;
