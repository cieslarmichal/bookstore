import { CustomerEntity } from '../../../contracts/customerEntity';
import { Customer } from '../../../contracts/customer';
import { CustomerMapper } from '../../../contracts/mappers/customerMapper/customerMapper';

export class CustomerMapperImpl implements CustomerMapper {
  public map(entity: CustomerEntity): Customer {
    const { id, createdAt, updatedAt, userId } = entity;

    return Customer.create({
      id,
      createdAt,
      updatedAt,
      userId,
    });
  }
}
