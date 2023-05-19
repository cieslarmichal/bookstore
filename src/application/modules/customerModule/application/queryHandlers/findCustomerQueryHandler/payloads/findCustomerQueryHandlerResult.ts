import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';
import { Customer } from '../../../../domain/entities/customer/customer';

export const findCustomerQueryHandlerResultSchema = Schema.object({
  customer: Schema.instanceof(Customer),
});

export type FindCustomerQueryHandlerResult = SchemaType<typeof findCustomerQueryHandlerResultSchema>;
