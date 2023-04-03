import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';
import { AccessTokenData } from '../../../../../common/types/accessTokenData';

export const createWhishlistEntryPayloadSchema = Schema.object({
  bookId: Schema.notEmptyString(),
  accessTokenData: Schema.unsafeType<AccessTokenData>(),
});

export type CreateWhishlistEntryPayload = SchemaType<typeof createWhishlistEntryPayloadSchema>;