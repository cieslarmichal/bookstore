import { AccessTokenData } from '../../../../../common/types/accessTokenData';
import { Schema } from '../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../libs/validator/schemaType';

export const deleteAddressPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
  accessTokenData: Schema.unsafeType<AccessTokenData>(),
});

export type DeleteAddressPayload = SchemaType<typeof deleteAddressPayloadSchema>;
