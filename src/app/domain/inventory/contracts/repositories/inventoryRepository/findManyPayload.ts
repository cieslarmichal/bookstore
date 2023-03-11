import { PaginationData } from '../../../../../../common/types/contracts/paginationData';
import { SchemaType } from '../../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../../libs/validator/implementations/schema';

export const findManyPayloadSchema = Schema.object({
  pagination: Schema.unsafeType<PaginationData>(),
});

export type FindManyPayload = SchemaType<typeof findManyPayloadSchema>;
