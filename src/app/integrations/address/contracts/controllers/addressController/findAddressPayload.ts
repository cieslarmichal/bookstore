import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';
import { AccessTokenData } from '../../../../accessTokenData';

export const findAddressPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
  accessTokenData: Schema.unsafeType<AccessTokenData>(),
});

export type FindAddressPayload = SchemaType<typeof findAddressPayloadSchema>;
