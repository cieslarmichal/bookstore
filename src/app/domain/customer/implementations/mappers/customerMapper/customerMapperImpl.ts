import { Injectable } from '../../../../../libs/dependencyInjection/contracts/decorators';
import { Customer } from '../../../contracts/customer';
import { CustomerEntity } from '../../../contracts/customerEntity';
import { CustomerMapper } from '../../../contracts/mappers/customerMapper/customerMapper';

@Injectable()
export class CustomerMapperImpl implements CustomerMapper {
  public map(entity: CustomerEntity): Customer {
    const { id, userId } = entity;

    return new Customer({ id, userId });
  }
}
