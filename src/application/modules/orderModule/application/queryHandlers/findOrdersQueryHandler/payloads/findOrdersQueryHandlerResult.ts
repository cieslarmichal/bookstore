import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';
import { Order } from '../../../../domain/entities/order/order';

export const findOrdersQueryHandlerResultSchema = Schema.object({
  orders: Schema.array(Schema.instanceof(Order)),
});

export type FindOrdersQueryHandlerResult = SchemaType<typeof findOrdersQueryHandlerResultSchema>;
