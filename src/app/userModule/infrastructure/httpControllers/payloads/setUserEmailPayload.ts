import { AccessTokenData } from '../../../../../common/types/contracts/accessTokenData';
import { SchemaType } from '../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../libs/validator/implementations/schema';

export const setUserEmailPayloadSchema = Schema.object({
  userId: Schema.notEmptyString(),
  email: Schema.notEmptyString(),
  accessTokenData: Schema.unsafeType<AccessTokenData>(),
});

export type SetUserEmailPayload = SchemaType<typeof setUserEmailPayloadSchema>;
