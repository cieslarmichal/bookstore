import { customerSchema } from './customerSchema';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const createCustomerBodySchema = Schema.object({
  userId: Schema.notEmptyString(),
});

export type CreateCustomerBody = SchemaType<typeof createCustomerBodySchema>;

export const createCustomerResponseCreatedBodySchema = Schema.object({
  customer: customerSchema,
});

export type CreateCustomerResponseCreatedBody = SchemaType<typeof createCustomerResponseCreatedBodySchema>;
