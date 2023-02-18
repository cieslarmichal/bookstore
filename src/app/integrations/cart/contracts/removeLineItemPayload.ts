import { SchemaType } from '../../../common/validator/contracts/schemaType';
import { Schema } from '../../../common/validator/implementations/schema';
import { AccessTokenData } from '../../accessTokenData';

export const removeLineItemPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
  lineItemId: Schema.notEmptyString(),
  quantity: Schema.positiveNumber(),
  accessTokenData: Schema.unsafeType<AccessTokenData>(),
});

export type RemoveLineItemPayload = SchemaType<typeof removeLineItemPayloadSchema>;
