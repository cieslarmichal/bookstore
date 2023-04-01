import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';
import { PaginationData } from '../../../../../../common/types/paginationData';

export const findManyPayloadSchema = Schema.object({
  pagination: Schema.unsafeType<PaginationData>(),
  cartId: Schema.notEmptyString(),
});

export type FindManyPayload = SchemaType<typeof findManyPayloadSchema>;
