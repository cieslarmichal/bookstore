import { SchemaType } from '../../../common/validator/contracts/schemaType';
import { Schema } from '../../../common/validator/implementations/schema';
import { AccessTokenData } from '../../accessTokenData';

export const setUserEmailPayloadSchema = Schema.object({
  userId: Schema.notEmptyString(),
  email: Schema.notEmptyString(),
  accessTokenData: Schema.unsafeType<AccessTokenData>(),
});

export type SetUserEmailPayload = SchemaType<typeof setUserEmailPayloadSchema>;
