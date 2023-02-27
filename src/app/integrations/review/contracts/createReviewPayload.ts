import { SchemaType } from '../../../common/validator/contracts/schemaType';
import { Schema } from '../../../common/validator/implementations/schema';
import { AccessTokenData } from '../../accessTokenData';

export const createReviewPayloadSchema = Schema.object({
  isbn: Schema.notEmptyString(),
  rate: Schema.positiveInteger(),
  comment: Schema.notEmptyString().optional(),
  accessTokenData: Schema.unsafeType<AccessTokenData>(),
});

export type CreateReviewPayload = SchemaType<typeof createReviewPayloadSchema>;
