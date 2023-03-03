import { SchemaType } from '../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../libs/validator/implementations/schema';
import { AccessTokenData } from '../../accessTokenData';

export const createReviewPayloadSchema = Schema.object({
  isbn: Schema.notEmptyString(),
  rate: Schema.positiveInteger(),
  comment: Schema.notEmptyString().optional(),
  accessTokenData: Schema.unsafeType<AccessTokenData>(),
});

export type CreateReviewPayload = SchemaType<typeof createReviewPayloadSchema>;
