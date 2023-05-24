import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findReviewQueryHandlerPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  reviewId: Schema.string(),
});

export type FindReviewQueryHandlerPayload = SchemaType<typeof findReviewQueryHandlerPayloadSchema>;
