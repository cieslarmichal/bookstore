import { orderSchema } from './orderSchema';
import { Schema } from '../../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../../libs/validator/schemaType';
import { PaymentMethod } from '../../../../../domain/entities/order/paymentMethod';

export const createOrderBodySchema = Schema.object({
  cartId: Schema.notEmptyString(),
  paymentMethod: Schema.enum(PaymentMethod),
});

export type CreateOrderBody = SchemaType<typeof createOrderBodySchema>;

export const createOrderResponseCreatedBodySchema = Schema.object({
  order: orderSchema,
});

export type CreateOrderResponseCreatedBody = SchemaType<typeof createOrderResponseCreatedBodySchema>;
