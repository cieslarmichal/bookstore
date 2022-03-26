import { Mapper } from '../../../shared/mapper';
import { CustomerDto } from '../dtos';
import { Customer } from '../entities/customer';

export class CustomerMapper implements Mapper<Customer, CustomerDto> {
  public mapEntityToDto(entity: Customer): CustomerDto {
    const { id, createdAt, updatedAt, userId } = entity;

    return CustomerDto.create({
      id,
      createdAt,
      updatedAt,
      userId,
    });
  }
}
