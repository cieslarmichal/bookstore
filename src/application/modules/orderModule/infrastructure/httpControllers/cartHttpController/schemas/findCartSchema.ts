import { cartSchema } from './cartSchema';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findCartPathParametersSchema = Schema.object({
  id: Schema.string(),
});

export type FindCartPathParameters = SchemaType<typeof findCartPathParametersSchema>;

export const findCartResponseOkBodySchema = Schema.object({
  cart: cartSchema,
});

export type FindCartResponseOkBody = SchemaType<typeof findCartResponseOkBodySchema>;
