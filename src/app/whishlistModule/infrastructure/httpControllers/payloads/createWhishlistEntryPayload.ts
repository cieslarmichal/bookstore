import { AccessTokenData } from '../../../../../common/types/accessTokenData';
import { SchemaType } from '../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../libs/validator/implementations/schema';

export const createWhishlistEntryPayloadSchema = Schema.object({
  bookId: Schema.notEmptyString(),
  accessTokenData: Schema.unsafeType<AccessTokenData>(),
});

export type CreateWhishlistEntryPayload = SchemaType<typeof createWhishlistEntryPayloadSchema>;
