import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';
import { Address } from '../../../../domain/entities/address/address';

export const createAddressCommandHandlerResultSchema = Schema.object({
  address: Schema.instanceof(Address),
});

export type CreateAddressCommandHandlerResult = SchemaType<typeof createAddressCommandHandlerResultSchema>;
