import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';
import { Address } from '../../../../domain/entities/address/address';

export const updateAddressCommandHandlerResultSchema = Schema.object({
  address: Schema.instanceof(Address),
});

export type UpdateAddressCommandHandlerResult = SchemaType<typeof updateAddressCommandHandlerResultSchema>;
