import { EntityManager } from 'typeorm';

import { CustomerEntity } from './customerEntity/customerEntity';
import { CustomerMapper } from './customerMapper/customerMapper';
import { Validator } from '../../../../../../libs/validator/validator';
import { CustomerRepository } from '../../../application/repositories/customerRepository/customerRepository';
import {
  CreateCustomerPayload,
  createCustomerPayloadSchema,
} from '../../../application/repositories/customerRepository/payloads/createCustomerPayload';
import {
  DeleteCustomerPayload,
  deleteCustomerPayloadSchema,
} from '../../../application/repositories/customerRepository/payloads/deleteCustomerPayload';
import {
  FindCustomerPayload,
  findCustomerPayloadSchema,
} from '../../../application/repositories/customerRepository/payloads/findCustomerPayload';
import { Customer } from '../../../domain/entities/customer/customer';
import { CustomerNotFoundError } from '../../../application/errors/customerNotFoundError';

export class CustomerRepositoryImpl implements CustomerRepository {
  public constructor(private readonly entityManager: EntityManager, private readonly customerMapper: CustomerMapper) {}

  public async createCustomer(input: CreateCustomerPayload): Promise<Customer> {
    const { id, userId } = Validator.validate(createCustomerPayloadSchema, input);

    const customerEntity = this.entityManager.create(CustomerEntity, { id, userId });

    const savedCustomerEntity = await this.entityManager.save(customerEntity);

    return this.customerMapper.map(savedCustomerEntity);
  }

  public async findCustomer(input: FindCustomerPayload): Promise<Customer | null> {
    const { id, userId } = Validator.validate(findCustomerPayloadSchema, input);

    let findOneInput = {};

    if (id) {
      findOneInput = { ...findOneInput, id };
    }

    if (userId) {
      findOneInput = { ...findOneInput, userId };
    }

    const customerEntity = await this.entityManager.findOne(CustomerEntity, { where: { ...findOneInput } });

    if (!customerEntity) {
      return null;
    }

    return this.customerMapper.map(customerEntity);
  }

  public async deleteCustomer(input: DeleteCustomerPayload): Promise<void> {
    const { id } = Validator.validate(deleteCustomerPayloadSchema, input);

    const customerEntity = await this.findCustomer({ id });

    if (!customerEntity) {
      throw new CustomerNotFoundError({ id });
    }

    await this.entityManager.delete(CustomerEntity, { id });
  }
}
