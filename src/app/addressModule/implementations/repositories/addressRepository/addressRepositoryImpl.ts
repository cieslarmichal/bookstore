import { EntityManager } from 'typeorm';

import { AddressQueryBuilder } from './addressQueryBuilder';
import { Validator } from '../../../../../../libs/validator/implementations/validator';
import { AddressRepository } from '../../../contracts/repositories/addressRepository/addressRepository';
import {
  CreateOnePayload,
  createOnePayloadSchema,
} from '../../../contracts/repositories/addressRepository/createOnePayload';
import {
  DeleteOnePayload,
  deleteOnePayloadSchema,
} from '../../../contracts/repositories/addressRepository/deleteOnePayload';
import {
  FindManyPayload,
  findManyPayloadSchema,
} from '../../../contracts/repositories/addressRepository/findManyPayload';
import { FindOnePayload, findOnePayloadSchema } from '../../../contracts/repositories/addressRepository/findOnePayload';
import {
  UpdateOnePayload,
  updateOnePayloadSchema,
} from '../../../contracts/repositories/addressRepository/updateOnePayload';
import { Address } from '../../../domain/entities/address/address';
import { AddressNotFoundError } from '../../../infrastructure/errors/addressNotFoundError';
import { AddressEntity } from '../../../infrastructure/repositories/addressRepository/addressEntity/addressEntity';
import { AddressMapper } from '../../../infrastructure/repositories/addressRepository/addressMapper/addressMapper';

export class AddressRepositoryImpl implements AddressRepository {
  public constructor(private readonly entityManager: EntityManager, private readonly addressMapper: AddressMapper) {}

  public async createOne(input: CreateOnePayload): Promise<Address> {
    const {
      id,
      firstName,
      lastName,
      phoneNumber,
      country,
      state,
      city,
      zipCode,
      streetAddress,
      deliveryInstructions,
      customerId,
    } = Validator.validate(createOnePayloadSchema, input);

    let addressEntityInput: AddressEntity = {
      id,
      firstName,
      lastName,
      phoneNumber,
      country,
      state,
      city,
      zipCode,
      streetAddress,
      customerId,
    };

    if (deliveryInstructions) {
      addressEntityInput = { ...addressEntityInput, deliveryInstructions };
    }

    const addressEntity = this.entityManager.create(AddressEntity, addressEntityInput);

    const savedAddressEntity = await this.entityManager.save(addressEntity);

    return this.addressMapper.map(savedAddressEntity);
  }

  public async findOne(input: FindOnePayload): Promise<Address | null> {
    const { id } = Validator.validate(findOnePayloadSchema, input);

    const addressEntity = await this.entityManager.findOne(AddressEntity, { where: { id } });

    if (!addressEntity) {
      return null;
    }

    return this.addressMapper.map(addressEntity);
  }

  public async findMany(input: FindManyPayload): Promise<Address[]> {
    const { filters, pagination } = Validator.validate(findManyPayloadSchema, input);

    const addressQueryBuilder = new AddressQueryBuilder(this.entityManager);

    const numberOfEnitiesToSkip = (pagination.page - 1) * pagination.limit;

    const addressesEntities = await addressQueryBuilder
      .where(filters)
      .skip(numberOfEnitiesToSkip)
      .take(pagination.limit)
      .getMany();

    return addressesEntities.map((address) => this.addressMapper.map(address));
  }

  public async updateOne(input: UpdateOnePayload): Promise<Address> {
    const {
      id,
      draft: { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress, deliveryInstructions },
    } = Validator.validate(updateOnePayloadSchema, input);

    const addressEntity = await this.findOne({ id });

    if (!addressEntity) {
      throw new AddressNotFoundError({ id });
    }

    let addressEntityInput: Partial<AddressEntity> = {};

    if (firstName) {
      addressEntityInput = { ...addressEntityInput, firstName };
    }

    if (lastName) {
      addressEntityInput = { ...addressEntityInput, lastName };
    }

    if (phoneNumber) {
      addressEntityInput = { ...addressEntityInput, phoneNumber };
    }

    if (country) {
      addressEntityInput = { ...addressEntityInput, country };
    }

    if (state) {
      addressEntityInput = { ...addressEntityInput, state };
    }

    if (city) {
      addressEntityInput = { ...addressEntityInput, city };
    }

    if (zipCode) {
      addressEntityInput = { ...addressEntityInput, zipCode };
    }

    if (streetAddress) {
      addressEntityInput = { ...addressEntityInput, streetAddress };
    }

    if (deliveryInstructions) {
      addressEntityInput = { ...addressEntityInput, deliveryInstructions };
    }

    await this.entityManager.update(AddressEntity, { id }, { ...addressEntityInput });

    const updatedAddressEntity = await this.findOne({ id });

    return updatedAddressEntity as Address;
  }

  public async deleteOne(input: DeleteOnePayload): Promise<void> {
    const { id } = Validator.validate(deleteOnePayloadSchema, input);

    const addressEntity = await this.findOne({ id });

    if (!addressEntity) {
      throw new AddressNotFoundError({ id });
    }

    await this.entityManager.delete(AddressEntity, { id });
  }
}
