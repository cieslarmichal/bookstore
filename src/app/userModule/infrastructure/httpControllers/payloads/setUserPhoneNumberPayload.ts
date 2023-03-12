import { SchemaType } from '../../../../../libs/validator/schemaType';
import { Schema } from '../../../../../libs/validator/schema';
import { AccessTokenData } from '../../../../../common/types/accessTokenData';

export const setUserPhoneNumberPayloadSchema = Schema.object({
  userId: Schema.notEmptyString(),
  phoneNumber: Schema.notEmptyString(),
  accessTokenData: Schema.unsafeType<AccessTokenData>(),
});

export type SetUserPhoneNumberPayload = SchemaType<typeof setUserPhoneNumberPayloadSchema>;
