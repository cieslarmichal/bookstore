import { EntityManager, EntityRepository, FindConditions } from 'typeorm';
import { CustomerDto } from '../dtos';
import { Customer } from '../entities/customer';
import { CustomerMapper } from '../mappers/customerMapper';
import { CustomerNotFound } from '../errors';

@EntityRepository()
export class CustomerRepository {
  public constructor(private readonly entityManager: EntityManager, private readonly customerMapper: CustomerMapper) {}

  public async createOne(customerData: Partial<Customer>): Promise<CustomerDto> {
    const customer = this.entityManager.create(Customer, customerData);

    const savedCustomer = await this.entityManager.save(customer);

    return this.customerMapper.mapEntityToDto(savedCustomer);
  }

  public async findOne(conditions: FindConditions<Customer>): Promise<CustomerDto | null> {
    const customer = await this.entityManager.findOne(Customer, conditions);

    if (!customer) {
      return null;
    }

    return this.customerMapper.mapEntityToDto(customer);
  }

  public async findOneById(id: string): Promise<CustomerDto | null> {
    return this.findOne({ id });
  }

  public async findMany(conditions: FindConditions<Customer>): Promise<CustomerDto[]> {
    const customeres = await this.entityManager.find(Customer, conditions);

    return customeres.map((customer) => this.customerMapper.mapEntityToDto(customer));
  }

  public async updateOne(id: string, customerData: Partial<Customer>): Promise<CustomerDto> {
    const customer = await this.findOneById(id);

    if (!customer) {
      throw new CustomerNotFound({ id });
    }

    await this.entityManager.update(Customer, { id }, customerData);

    return this.findOneById(id) as Promise<CustomerDto>;
  }

  public async removeOne(id: string): Promise<void> {
    const customer = await this.findOneById(id);

    if (!customer) {
      throw new CustomerNotFound({ id });
    }

    await this.entityManager.delete(Customer, { id });
  }
}
