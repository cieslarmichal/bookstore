import { SchemaType } from '../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../libs/validator/implementations/schema';
import { AccessTokenData } from '../../../../../common/types/contracts/accessTokenData';

export const removeLineItemPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
  lineItemId: Schema.notEmptyString(),
  quantity: Schema.positiveNumber(),
  accessTokenData: Schema.unsafeType<AccessTokenData>(),
});

export type RemoveLineItemPayload = SchemaType<typeof removeLineItemPayloadSchema>;
