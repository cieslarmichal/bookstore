import { EntityManager } from 'typeorm';

import { AddressEntity } from './addressEntity/addressEntity';
import { AddressMapper } from './addressMapper/addressMapper';
import { AddressQueryBuilder } from './addressQueryBuilder';
import { Validator } from '../../../../../../libs/validator/validator';
import { AddressNotFoundError } from '../../../application/errors/addressNotFoundError';
import { AddressRepository } from '../../../application/repositories/addressRepository/addressRepository';
import {
  CreateAddressPayload,
  createAddressPayloadSchema,
} from '../../../application/repositories/addressRepository/payloads/createAddressPayload';
import {
  DeleteAddressPayload,
  deleteAddressPayloadSchema,
} from '../../../application/repositories/addressRepository/payloads/deleteAddressPayload';
import {
  FindAddressesPayload,
  findAddressesPayloadSchema,
} from '../../../application/repositories/addressRepository/payloads/findAddressesPayload';
import {
  FindAddressPayload,
  findAddressPayloadSchema,
} from '../../../application/repositories/addressRepository/payloads/findAddressPayload';
import {
  UpdateAddressPayload,
  updateAddressPayloadSchema,
} from '../../../application/repositories/addressRepository/payloads/updateAddressPayload';
import { Address } from '../../../domain/entities/address/address';

export class AddressRepositoryImpl implements AddressRepository {
  public constructor(private readonly entityManager: EntityManager, private readonly addressMapper: AddressMapper) {}

  public async createAddress(input: CreateAddressPayload): Promise<Address> {
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
    } = Validator.validate(createAddressPayloadSchema, input);

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

  public async findAddress(input: FindAddressPayload): Promise<Address | null> {
    const { id } = Validator.validate(findAddressPayloadSchema, input);

    const addressEntity = await this.entityManager.findOne(AddressEntity, { where: { id } });

    if (!addressEntity) {
      return null;
    }

    return this.addressMapper.map(addressEntity);
  }

  public async findAddresses(input: FindAddressesPayload): Promise<Address[]> {
    const { filters, pagination } = Validator.validate(findAddressesPayloadSchema, input);

    const addressQueryBuilder = new AddressQueryBuilder(this.entityManager);

    const numberOfEnitiesToSkip = (pagination.page - 1) * pagination.limit;

    const addressesEntities = await addressQueryBuilder
      .where(filters)
      .skip(numberOfEnitiesToSkip)
      .take(pagination.limit)
      .getMany();

    return addressesEntities.map((address) => this.addressMapper.map(address));
  }

  public async updateAddress(input: UpdateAddressPayload): Promise<Address> {
    const {
      id,
      draft: { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress, deliveryInstructions },
    } = Validator.validate(updateAddressPayloadSchema, input);

    const addressEntity = await this.findAddress({ id });

    if (!addressEntity) {
      throw new AddressNotFoundError({ addressId: id });
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

    const updatedAddressEntity = await this.findAddress({ id });

    return updatedAddressEntity as Address;
  }

  public async deleteAddress(input: DeleteAddressPayload): Promise<void> {
    const { id } = Validator.validate(deleteAddressPayloadSchema, input);

    const addressEntity = await this.findAddress({ id });

    if (!addressEntity) {
      throw new AddressNotFoundError({ addressId: id });
    }

    await this.entityManager.delete(AddressEntity, { id });
  }
}
