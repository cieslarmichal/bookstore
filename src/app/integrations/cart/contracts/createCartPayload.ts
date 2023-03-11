import { SchemaType } from '../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../libs/validator/implementations/schema';
import { AccessTokenData } from '../../accessTokenData';

export const createCartPayloadSchema = Schema.object({
  customerId: Schema.notEmptyString(),
  accessTokenData: Schema.unsafeType<AccessTokenData>(),
});

export type CreateCartPayload = SchemaType<typeof createCartPayloadSchema>;
