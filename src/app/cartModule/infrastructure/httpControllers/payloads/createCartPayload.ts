import { AccessTokenData } from '../../../../../common/types/accessTokenData';
import { SchemaType } from '../../../../../libs/validator/schemaType';
import { Schema } from '../../../../../libs/validator/implementations/schema';

export const createCartPayloadSchema = Schema.object({
  customerId: Schema.notEmptyString(),
  accessTokenData: Schema.unsafeType<AccessTokenData>(),
});

export type CreateCartPayload = SchemaType<typeof createCartPayloadSchema>;
