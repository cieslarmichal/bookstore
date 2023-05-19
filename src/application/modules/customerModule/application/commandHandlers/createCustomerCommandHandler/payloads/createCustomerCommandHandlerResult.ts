import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';
import { Customer } from '../../../../domain/entities/customer/customer';

export const createCustomerCommandHandlerResultSchema = Schema.object({
  customer: Schema.instanceof(Customer),
});

export type CreateCustomerCommandHandlerResult = SchemaType<typeof createCustomerCommandHandlerResultSchema>;
