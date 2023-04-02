import { AccessTokenData } from '../../../../../common/types/accessTokenData';
import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';

export const createReviewPayloadSchema = Schema.object({
  isbn: Schema.notEmptyString(),
  rate: Schema.positiveInteger(),
  comment: Schema.notEmptyString().optional(),
  accessTokenData: Schema.unsafeType<AccessTokenData>(),
});

export type CreateReviewPayload = SchemaType<typeof createReviewPayloadSchema>;
