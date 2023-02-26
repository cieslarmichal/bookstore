import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';

export const createOnePayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
  bookId: Schema.notEmptyString(),
  quantity: Schema.integer(),
});

export type CreateOnePayload = SchemaType<typeof createOnePayloadSchema>;
