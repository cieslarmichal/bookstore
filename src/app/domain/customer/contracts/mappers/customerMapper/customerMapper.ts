import { Mapper } from '../../../../../../common/types/contracts/mapper';
import { Customer } from '../../customer';
import { CustomerEntity } from '../../customerEntity';

export type CustomerMapper = Mapper<CustomerEntity, Customer>;
