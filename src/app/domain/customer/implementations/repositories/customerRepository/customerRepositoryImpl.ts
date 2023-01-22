import { EntityManager, EntityRepository, FindConditions } from 'typeorm';

import { Customer } from '../../../contracts/customer';
import { CustomerEntity } from '../../../contracts/customerEntity';
import { CustomerMapper } from '../../../contracts/mappers/customerMapper/customerMapper';
import { CustomerRepository } from '../../../contracts/repositories/customerRepository/customerRepository';
import { CustomerNotFoundError } from '../../../errors/customerNotFoundError';

@EntityRepository()
export class CustomerRepositoryImpl implements CustomerRepository {
  public constructor(private readonly entityManager: EntityManager, private readonly customerMapper: CustomerMapper) {}

  public async createOne(customerData: Partial<CustomerEntity>): Promise<Customer> {
    const customer = this.entityManager.create(CustomerEntity, customerData);

    const savedCustomer = await this.entityManager.save(customer);

    return this.customerMapper.map(savedCustomer);
  }

  public async findOne(conditions: FindConditions<CustomerEntity>): Promise<Customer | null> {
    const customer = await this.entityManager.findOne(CustomerEntity, conditions);

    if (!customer) {
      return null;
    }

    return this.customerMapper.map(customer);
  }

  public async findOneById(id: string): Promise<Customer | null> {
    return this.findOne({ id });
  }

  public async findMany(conditions: FindConditions<CustomerEntity>): Promise<Customer[]> {
    const customeres = await this.entityManager.find(CustomerEntity, conditions);

    return customeres.map((customer) => this.customerMapper.map(customer));
  }

  public async updateOne(id: string, customerData: Partial<CustomerEntity>): Promise<Customer> {
    const customer = await this.findOneById(id);

    if (!customer) {
      throw new CustomerNotFoundError({ id });
    }

    await this.entityManager.update(CustomerEntity, { id }, customerData);

    return this.findOneById(id) as Promise<Customer>;
  }

  public async removeOne(id: string): Promise<void> {
    const customer = await this.findOneById(id);

    if (!customer) {
      throw new CustomerNotFoundError({ id });
    }

    await this.entityManager.delete(CustomerEntity, { id });
  }
}
