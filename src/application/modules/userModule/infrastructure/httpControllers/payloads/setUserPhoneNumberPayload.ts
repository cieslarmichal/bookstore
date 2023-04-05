import { AccessTokenData } from '../../../../../common/types/accessTokenData';
import { Schema } from '../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../libs/validator/schemaType';

export const setUserPhoneNumberPayloadSchema = Schema.object({
  userId: Schema.string(),
  phoneNumber: Schema.string(),
  accessTokenData: Schema.unsafeType<AccessTokenData>(),
});

export type SetUserPhoneNumberPayload = SchemaType<typeof setUserPhoneNumberPayloadSchema>;
