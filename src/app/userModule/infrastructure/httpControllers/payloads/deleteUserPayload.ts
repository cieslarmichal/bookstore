import { AccessTokenData } from '../../../../../common/types/accessTokenData';
import { SchemaType } from '../../../../../libs/validator/schemaType';
import { Schema } from '../../../../../libs/validator/implementations/schema';

export const deleteUserPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
  accessTokenData: Schema.unsafeType<AccessTokenData>(),
});

export type DeleteUserPayload = SchemaType<typeof deleteUserPayloadSchema>;