import { PaginationData } from '../../../../../../common/types/contracts/paginationData';
import { Schema } from '../../../../../../libs/validator/implementations/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';

export const findManyPayloadSchema = Schema.object({
  pagination: Schema.unsafeType<PaginationData>(),
});

export type FindManyPayload = SchemaType<typeof findManyPayloadSchema>;
