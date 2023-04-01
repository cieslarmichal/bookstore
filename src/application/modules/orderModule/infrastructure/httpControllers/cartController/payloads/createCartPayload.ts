import { AccessTokenData } from '../../../../../../../common/types/accessTokenData';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const createCartPayloadSchema = Schema.object({
  customerId: Schema.notEmptyString(),
  accessTokenData: Schema.unsafeType<AccessTokenData>(),
});

export type CreateCartPayload = SchemaType<typeof createCartPayloadSchema>;
