import { PaginationData } from '../../../common/types/contracts/paginationData';
import { SchemaType } from '../../../common/validator/contracts/schemaType';
import { Schema } from '../../../common/validator/implementations/schema';
import { AccessTokenData } from '../../accessTokenData';

export const findOrdersPayloadSchema = Schema.object({
  accessTokenData: Schema.unsafeType<AccessTokenData>(),
  pagination: Schema.unsafeType<PaginationData>(),
});

export type FindOrdersPayload = SchemaType<typeof findOrdersPayloadSchema>;
