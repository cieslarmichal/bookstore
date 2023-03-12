import { AccessTokenData } from '../../../../../common/types/contracts/accessTokenData';
import { SchemaType } from '../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../libs/validator/implementations/schema';

export const deleteWhishlistEntryPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
  accessTokenData: Schema.unsafeType<AccessTokenData>(),
});

export type DeleteWhishlistEntryPayload = SchemaType<typeof deleteWhishlistEntryPayloadSchema>;
