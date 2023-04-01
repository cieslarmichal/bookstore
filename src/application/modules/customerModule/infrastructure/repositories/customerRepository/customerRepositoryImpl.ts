import { EntityManager } from 'typeorm';

import { CustomerEntity } from './customerEntity/customerEntity';
import { CustomerMapper } from './customerMapper/customerMapper';
import { Validator } from '../../../../../../libs/validator/validator';
import { CustomerRepository } from '../../../application/repositories/customerRepository/customerRepository';
import {
  CreateOnePayload,
  createOnePayloadSchema,
} from '../../../application/repositories/customerRepository/payloads/createOnePayload';
import {
  DeleteOnePayload,
  deleteOnePayloadSchema,
} from '../../../application/repositories/customerRepository/payloads/deleteOnePayload';
import {
  FindOnePayload,
  findOnePayloadSchema,
} from '../../../application/repositories/customerRepository/payloads/findOnePayload';
import { Customer } from '../../../domain/entities/customer/customer';
import { CustomerNotFoundError } from '../../../infrastructure/errors/customerNotFoundError';

export class CustomerRepositoryImpl implements CustomerRepository {
  public constructor(private readonly entityManager: EntityManager, private readonly customerMapper: CustomerMapper) {}

  public async createOne(input: CreateOnePayload): Promise<Customer> {
    const { id, userId } = Validator.validate(createOnePayloadSchema, input);

    const customerEntity = this.entityManager.create(CustomerEntity, { id, userId });

    const savedCustomerEntity = await this.entityManager.save(customerEntity);

    return this.customerMapper.map(savedCustomerEntity);
  }

  public async findOne(input: FindOnePayload): Promise<Customer | null> {
    const { id, userId } = Validator.validate(findOnePayloadSchema, input);

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

  public async deleteOne(input: DeleteOnePayload): Promise<void> {
    const { id } = Validator.validate(deleteOnePayloadSchema, input);

    const customerEntity = await this.findOne({ id });

    if (!customerEntity) {
      throw new CustomerNotFoundError({ id });
    }

    await this.entityManager.delete(CustomerEntity, { id });
  }
}
