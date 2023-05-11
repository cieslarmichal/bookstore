import { cartSchema } from './cartSchema';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const createCartBodySchema = Schema.object({
  customerId: Schema.string(),
});

export type CreateCartBody = SchemaType<typeof createCartBodySchema>;

export const createCartResponseCreatedBodySchema = Schema.object({
  cart: cartSchema,
});

export type CreateCartResponseCreatedBody = SchemaType<typeof createCartResponseCreatedBodySchema>;
