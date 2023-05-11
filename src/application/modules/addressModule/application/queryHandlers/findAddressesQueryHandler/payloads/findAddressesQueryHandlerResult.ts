import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';
import { Address } from '../../../../domain/entities/address/address';

export const findAddressesQueryHandlerResultSchema = Schema.object({
  addresses: Schema.array(Schema.instanceof(Address)),
});

export type FindAddressesQueryHandlerResult = SchemaType<typeof findAddressesQueryHandlerResultSchema>;
