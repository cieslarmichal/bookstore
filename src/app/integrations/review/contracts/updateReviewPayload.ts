import { SchemaType } from '../../../common/validator/contracts/schemaType';
import { Schema } from '../../../common/validator/implementations/schema';
import { AccessTokenData } from '../../accessTokenData';

export const updateReviewPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
  rate: Schema.positiveInteger().optional(),
  comment: Schema.notEmptyString().optional(),
  accessTokenData: Schema.unsafeType<AccessTokenData>(),
});

export type UpdateReviewPayload = SchemaType<typeof updateReviewPayloadSchema>;
