import { EntityManager } from 'typeorm';

import { Customer } from '../../../contracts/customer';
import { CustomerEntity } from '../../../contracts/customerEntity';
import { CustomerMapper } from '../../../contracts/mappers/customerMapper/customerMapper';
import { CreateOnePayload } from '../../../contracts/repositories/customerRepository/createOnePayload';
import { CustomerRepository } from '../../../contracts/repositories/customerRepository/customerRepository';
import { DeleteOnePayload } from '../../../contracts/repositories/customerRepository/deleteOnePayload';
import { FindOnePayload } from '../../../contracts/repositories/customerRepository/findOnePayload';
import { CustomerNotFoundError } from '../../../errors/customerNotFoundError';

export class CustomerRepositoryImpl implements CustomerRepository {
  public constructor(private readonly entityManager: EntityManager, private readonly customerMapper: CustomerMapper) {}

  public async createOne(input: CreateOnePayload): Promise<Customer> {
    const customerEntityInput: CustomerEntity = input;

    const customerEntity = this.entityManager.create(CustomerEntity, customerEntityInput);

    const savedCustomerEntity = await this.entityManager.save(customerEntity);

    return this.customerMapper.map(savedCustomerEntity);
  }

  public async findOne(input: FindOnePayload): Promise<Customer | null> {
    const customerEntity = await this.entityManager.findOne(CustomerEntity, { where: { ...input } });

    if (!customerEntity) {
      return null;
    }

    return this.customerMapper.map(customerEntity);
  }

  public async deleteOne(input: DeleteOnePayload): Promise<void> {
    const { id } = input;

    const customerEntity = await this.findOne({ id });

    if (!customerEntity) {
      throw new CustomerNotFoundError({ id });
    }

    await this.entityManager.delete(CustomerEntity, { id });
  }
}
