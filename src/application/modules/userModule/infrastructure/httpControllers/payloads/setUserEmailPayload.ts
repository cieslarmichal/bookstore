import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';
import { AccessTokenData } from '../../../../../common/types/accessTokenData';

export const setUserEmailPayloadSchema = Schema.object({
  userId: Schema.string(),
  email: Schema.string(),
  accessTokenData: Schema.unsafeType<AccessTokenData>(),
});

export type SetUserEmailPayload = SchemaType<typeof setUserEmailPayloadSchema>;
