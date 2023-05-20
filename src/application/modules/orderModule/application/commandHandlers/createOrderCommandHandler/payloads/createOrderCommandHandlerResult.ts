import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';
import { Order } from '../../../../domain/entities/order/order';

export const createOrderCommandHandlerResultSchema = Schema.object({
  order: Schema.instanceof(Order),
});

export type CreateOrderCommandHandlerResult = SchemaType<typeof createOrderCommandHandlerResultSchema>;
