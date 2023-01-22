import { Customer } from '../../../contracts/customer';
import { CustomerEntity } from '../../../contracts/customerEntity';
import { CustomerMapper } from '../../../contracts/mappers/customerMapper/customerMapper';

export class CustomerMapperImpl implements CustomerMapper {
  public map(entity: CustomerEntity): Customer {
    const { id, createdAt, updatedAt, userId } = entity;

    return new Customer({
      id,
      createdAt,
      updatedAt,
      userId,
    });
  }
}
