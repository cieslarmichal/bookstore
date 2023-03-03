import { SchemaType } from '../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../libs/validator/implementations/schema';
import { AccessTokenData } from '../../accessTokenData';

export const deleteAddressPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
  accessTokenData: Schema.unsafeType<AccessTokenData>(),
});

export type DeleteAddressPayload = SchemaType<typeof deleteAddressPayloadSchema>;
