import { customerSchema } from './customerSchema';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findCustomerPathParametersSchema = Schema.object({
  id: Schema.string(),
});

export type FindCustomerPathParameters = SchemaType<typeof findCustomerPathParametersSchema>;

export const findCustomerResponseOkBodySchema = Schema.object({
  customer: customerSchema,
});

export type FindCustomerResponseOkBody = SchemaType<typeof findCustomerResponseOkBodySchema>;
