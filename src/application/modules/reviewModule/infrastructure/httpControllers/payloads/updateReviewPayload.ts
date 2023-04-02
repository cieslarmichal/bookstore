import { AccessTokenData } from '../../../../../common/types/accessTokenData';
import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';

export const updateReviewPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
  rate: Schema.positiveInteger().optional(),
  comment: Schema.notEmptyString().optional(),
  accessTokenData: Schema.unsafeType<AccessTokenData>(),
});

export type UpdateReviewPayload = SchemaType<typeof updateReviewPayloadSchema>;
