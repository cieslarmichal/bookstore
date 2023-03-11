import { Injectable } from '../../../../../../libs/dependencyInjection/contracts/decorators';
import { Customer } from '../../../contracts/customer';
import { CustomerEntity } from '../../../contracts/customerEntity';
import { CustomerMapper } from '../../../contracts/mappers/customerMapper/customerMapper';

@Injectable()
export class CustomerMapperImpl implements CustomerMapper {
  public map({ id, userId }: CustomerEntity): Customer {
    return new Customer({ id, userId });
  }
}
