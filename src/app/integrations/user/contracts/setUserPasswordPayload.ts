import { SchemaType } from '../../../common/validator/contracts/schemaType';
import { Schema } from '../../../common/validator/implementations/schema';
import { AccessTokenData } from '../../accessTokenData';

export const setUserPasswordPayloadSchema = Schema.object({
  userId: Schema.notEmptyString(),
  password: Schema.notEmptyString(),
  accessTokenData: Schema.unsafeType<AccessTokenData>(),
});

export type SetUserPasswordPayload = SchemaType<typeof setUserPasswordPayloadSchema>;
