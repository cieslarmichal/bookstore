import { SchemaType } from '../../../common/validator/contracts/schemaType';
import { Schema } from '../../../common/validator/implementations/schema';
import { AccessTokenData } from '../../accessTokenData';

export const addLineItemPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
  bookId: Schema.notEmptyString(),
  quantity: Schema.positiveNumber(),
  accessTokenData: Schema.unsafeType<AccessTokenData>(),
});

export type AddLineItemPayload = SchemaType<typeof addLineItemPayloadSchema>;
