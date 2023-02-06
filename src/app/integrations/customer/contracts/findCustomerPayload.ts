import { SchemaType } from '../../../common/validator/contracts/schemaType';
import { Schema } from '../../../common/validator/implementations/schema';

export const findCustomerPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
});

export type FindCustomerPayload = SchemaType<typeof findCustomerPayloadSchema>;
