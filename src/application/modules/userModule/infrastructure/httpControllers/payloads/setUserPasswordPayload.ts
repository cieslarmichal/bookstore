import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';
import { AccessTokenData } from '../../../../../common/types/accessTokenData';

export const setUserPasswordPayloadSchema = Schema.object({
  userId: Schema.string(),
  password: Schema.string(),
  accessTokenData: Schema.unsafeType<AccessTokenData>(),
});

export type SetUserPasswordPayload = SchemaType<typeof setUserPasswordPayloadSchema>;
