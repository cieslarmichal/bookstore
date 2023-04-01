import { AccessTokenData } from '../../../../../../../common/types/accessTokenData';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const addLineItemPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
  bookId: Schema.notEmptyString(),
  quantity: Schema.positiveNumber(),
  accessTokenData: Schema.unsafeType<AccessTokenData>(),
});

export type AddLineItemPayload = SchemaType<typeof addLineItemPayloadSchema>;
