import { SchemaType } from '../../../common/validator/contracts/schemaType';
import { Schema } from '../../../common/validator/implementations/schema';
import { AccessTokenData } from '../../accessTokenData';

export const setUserPhoneNumberPayloadSchema = Schema.object({
  userId: Schema.notEmptyString(),
  phoneNumber: Schema.notEmptyString(),
  accessTokenData: Schema.unsafeType<AccessTokenData>(),
});

export type SetUserPhoneNumberPayload = SchemaType<typeof setUserPhoneNumberPayloadSchema>;
