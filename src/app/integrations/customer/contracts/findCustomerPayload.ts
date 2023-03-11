import { SchemaType } from '../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../libs/validator/implementations/schema';

export const findCustomerPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
});

export type FindCustomerPayload = SchemaType<typeof findCustomerPayloadSchema>;
