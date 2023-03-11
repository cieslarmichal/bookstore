import { SchemaType } from '../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../libs/validator/implementations/schema';
import { AccessTokenData } from '../../accessTokenData';

export const setUserPasswordPayloadSchema = Schema.object({
  userId: Schema.notEmptyString(),
  password: Schema.notEmptyString(),
  accessTokenData: Schema.unsafeType<AccessTokenData>(),
});

export type SetUserPasswordPayload = SchemaType<typeof setUserPasswordPayloadSchema>;
