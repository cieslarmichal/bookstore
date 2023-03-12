import { AccessTokenData } from '../../../../../../common/types/accessTokenData';
import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';

export const findCartPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
  accessTokenData: Schema.unsafeType<AccessTokenData>(),
});

export type FindCartPayload = SchemaType<typeof findCartPayloadSchema>;
