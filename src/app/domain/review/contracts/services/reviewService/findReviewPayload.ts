import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';
import { SchemaType } from '../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../libs/validator/implementations/schema';

export const findReviewPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  reviewId: Schema.notEmptyString(),
});

export type FindReviewPayload = SchemaType<typeof findReviewPayloadSchema>;
