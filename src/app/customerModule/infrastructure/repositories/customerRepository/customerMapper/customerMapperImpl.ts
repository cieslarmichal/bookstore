import { CustomerMapper } from './customerMapper';
import { Injectable } from '../../../../../../libs/dependencyInjection/contracts/decorators';
import { Customer } from '../../../../domain/entities/customer/customer';
import { CustomerEntity } from '../customerEntity/customerEntity';

@Injectable()
export class CustomerMapperImpl implements CustomerMapper {
  public map({ id, userId }: CustomerEntity): Customer {
    return new Customer({ id, userId });
  }
}
