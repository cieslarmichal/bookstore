import { SchemaType } from '../../../common/validator/contracts/schemaType';
import { Schema } from '../../../common/validator/implementations/schema';
import { AccessTokenData } from '../../accessTokenData';

export const deleteReviewPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
  accessTokenData: Schema.unsafeType<AccessTokenData>(),
});

export type DeleteReviewPayload = SchemaType<typeof deleteReviewPayloadSchema>;
