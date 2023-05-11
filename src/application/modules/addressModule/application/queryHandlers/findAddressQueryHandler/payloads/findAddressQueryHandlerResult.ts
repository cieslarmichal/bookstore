import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';
import { Address } from '../../../../domain/entities/address/address';

export const findAddressQueryHandlerResultSchema = Schema.object({
  address: Schema.instanceof(Address),
});

export type FindAddressQueryHandlerResult = SchemaType<typeof findAddressQueryHandlerResultSchema>;
