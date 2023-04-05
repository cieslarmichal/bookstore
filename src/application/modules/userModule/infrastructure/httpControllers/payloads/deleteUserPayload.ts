import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';
import { AccessTokenData } from '../../../../../common/types/accessTokenData';

export const deleteUserPayloadSchema = Schema.object({
  id: Schema.string(),
  accessTokenData: Schema.unsafeType<AccessTokenData>(),
});

export type DeleteUserPayload = SchemaType<typeof deleteUserPayloadSchema>;
