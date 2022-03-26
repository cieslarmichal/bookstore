import { Mapper } from '../../../shared/mapper';
import { AddressDto } from '../dtos';
import { Address } from '../entities/address';

export class AddressMapper implements Mapper<Address, AddressDto> {
  public mapEntityToDto(entity: Address): AddressDto {
    const {
      id,
      createdAt,
      updatedAt,
      firstName,
      lastName,
      phoneNumber,
      country,
      state,
      city,
      zipCode,
      streetAddress,
      deliveryInstructions,
    } = entity;

    return AddressDto.create({
      id,
      createdAt,
      updatedAt,
      firstName,
      lastName,
      phoneNumber,
      country,
      state,
      city,
      zipCode,
      streetAddress,
      deliveryInstructions: deliveryInstructions || null,
    });
  }
}
