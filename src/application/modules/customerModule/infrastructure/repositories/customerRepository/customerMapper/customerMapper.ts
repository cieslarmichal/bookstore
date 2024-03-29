import { Mapper } from '../../../../../../../common/types/mapper';
import { Customer } from '../../../../domain/entities/customer/customer';
import { CustomerEntity } from '../customerEntity/customerEntity';

export type CustomerMapper = Mapper<CustomerEntity, Customer>;
