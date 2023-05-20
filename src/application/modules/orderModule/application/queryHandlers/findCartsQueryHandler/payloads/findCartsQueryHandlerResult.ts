import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';
import { Cart } from '../../../../domain/entities/cart/cart';

export const findCartsQueryHandlerResultSchema = Schema.object({
  carts: Schema.array(Schema.instanceof(Cart)),
});

export type FindCartsQueryHandlerResult = SchemaType<typeof findCartsQueryHandlerResultSchema>;
