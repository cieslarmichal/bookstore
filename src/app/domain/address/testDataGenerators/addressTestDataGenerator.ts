import { Address } from '../entities/address';
import { faker } from '@faker-js/faker';

export class AddressTestDataGenerator {
  public generateData(): Address {
    return {
      id: this.generateId(),
      createdAt: this.generateCreatedAt(),
      updatedAt: this.generateUpdatedAt(),
      fullName: this.generateFullName(),
      phoneNumber: this.generatePhoneNumber(),
      country: this.generateCountry(),
      state: this.generateState(),
      city: this.generateCity(),
      zipCode: this.generateZipCode(),
      streetAddress: this.generateStreetAddress(),
    };
  }

  public generateId(): string {
    return faker.datatype.uuid();
  }

  public generateCreatedAt(): Date {
    return faker.date.recent(3);
  }

  public generateUpdatedAt(): Date {
    return faker.date.recent(1);
  }

  public generateFullName(): string {
    return faker.name.firstName() + ' ' + faker.name.lastName();
  }

  public generatePhoneNumber(): string {
    return faker.phone.phoneNumber();
  }

  public generateCountry(): string {
    return faker.address.county();
  }

  public generateState(): string {
    return faker.address.county();
  }

  public generateCity(): string {
    return faker.address.cityName();
  }

  public generateZipCode(): string {
    return faker.address.zipCode();
  }

  public generateStreetAddress(): string {
    return faker.address.streetAddress(true);
  }
}
