import { AccessTokenData } from '../../../../../common/types/accessTokenData';
import { Schema } from '../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../libs/validator/schemaType';

export const setUserEmailPayloadSchema = Schema.object({
  userId: Schema.notEmptyString(),
  email: Schema.notEmptyString(),
  accessTokenData: Schema.unsafeType<AccessTokenData>(),
});

export type SetUserEmailPayload = SchemaType<typeof setUserEmailPayloadSchema>;
