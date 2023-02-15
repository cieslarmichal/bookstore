import { EntityManager } from 'typeorm';

import { AddressQueryBuilder } from './addressQueryBuilder';
import { PayloadFactory } from '../../../../../common/validator/implementations/payloadFactory';
import { Address } from '../../../contracts/address';
import { AddressEntity } from '../../../contracts/addressEntity';
import { AddressMapper } from '../../../contracts/mappers/addressMapper/addressMapper';
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
import { AddressNotFoundError } from '../../../errors/addressNotFoundError';

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
    } = PayloadFactory.create(createOnePayloadSchema, input);

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
    const { id } = PayloadFactory.create(findOnePayloadSchema, input);

    const addressEntity = await this.entityManager.findOne(AddressEntity, { where: { id } });

    if (!addressEntity) {
      return null;
    }

    return this.addressMapper.map(addressEntity);
  }

  public async findMany(input: FindManyPayload): Promise<Address[]> {
    const { filters, pagination } = PayloadFactory.create(findManyPayloadSchema, input);

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
    } = PayloadFactory.create(updateOnePayloadSchema, input);

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
    const { id } = PayloadFactory.create(deleteOnePayloadSchema, input);

    const addressEntity = await this.findOne({ id });

    if (!addressEntity) {
      throw new AddressNotFoundError({ id });
    }

    await this.entityManager.delete(AddressEntity, { id });
  }
}
