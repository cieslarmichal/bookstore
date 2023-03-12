import { SchemaType } from '../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../libs/validator/implementations/schema';
import { AccessTokenData } from '../../../../integrations/accessTokenData';

export const updateReviewPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
  rate: Schema.positiveInteger().optional(),
  comment: Schema.notEmptyString().optional(),
  accessTokenData: Schema.unsafeType<AccessTokenData>(),
});

export type UpdateReviewPayload = SchemaType<typeof updateReviewPayloadSchema>;
