import { AccessTokenData } from '../../../../../../common/types/accessTokenData';
import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';

export const removeLineItemPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
  lineItemId: Schema.notEmptyString(),
  quantity: Schema.positiveNumber(),
  accessTokenData: Schema.unsafeType<AccessTokenData>(),
});

export type RemoveLineItemPayload = SchemaType<typeof removeLineItemPayloadSchema>;
