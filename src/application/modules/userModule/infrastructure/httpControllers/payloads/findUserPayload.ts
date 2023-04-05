import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';
import { AccessTokenData } from '../../../../../common/types/accessTokenData';

export const findUserPayloadSchema = Schema.object({
  id: Schema.string(),
  accessTokenData: Schema.unsafeType<AccessTokenData>(),
});

export type FindUserPayload = SchemaType<typeof findUserPayloadSchema>;
