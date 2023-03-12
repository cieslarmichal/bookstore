import { AccessTokenData } from '../../../../../common/types/contracts/accessTokenData';
import { SchemaType } from '../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../libs/validator/implementations/schema';

export const addLineItemPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
  bookId: Schema.notEmptyString(),
  quantity: Schema.positiveNumber(),
  accessTokenData: Schema.unsafeType<AccessTokenData>(),
});

export type AddLineItemPayload = SchemaType<typeof addLineItemPayloadSchema>;
