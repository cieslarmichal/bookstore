import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';
import { Cart } from '../../../../domain/entities/cart/cart';

export const createCartCommandHandlerResultSchema = Schema.object({
  cart: Schema.instanceof(Cart),
});

export type CreateCartCommandHandlerResult = SchemaType<typeof createCartCommandHandlerResultSchema>;
