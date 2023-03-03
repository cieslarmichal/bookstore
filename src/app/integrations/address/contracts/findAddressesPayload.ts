import { Filter } from '../../../common/types/contracts/filter';
import { PaginationData } from '../../../common/types/contracts/paginationData';
import { SchemaType } from '../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../libs/validator/implementations/schema';
import { AccessTokenData } from '../../accessTokenData';

export const findAddressesPayloadSchema = Schema.object({
  filters: Schema.array(Schema.unsafeType<Filter>()),
  pagination: Schema.unsafeType<PaginationData>(),
  accessTokenData: Schema.unsafeType<AccessTokenData>(),
});

export type FindAddressesPayload = SchemaType<typeof findAddressesPayloadSchema>;
