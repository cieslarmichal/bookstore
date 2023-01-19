import { Mapper } from '../../../common/mapper';
import { CustomerDto } from '../dtos';
import { Customer } from '../entities/customer';

export class CustomerMapper implements Mapper<Customer, CustomerDto> {
  public map(entity: Customer): CustomerDto {
    const { id, createdAt, updatedAt, userId } = entity;

    return CustomerDto.create({
      id,
      createdAt,
      updatedAt,
      userId,
    });
  }
}
