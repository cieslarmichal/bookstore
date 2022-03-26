import { Address } from '../entities/address';
import { faker } from '@faker-js/faker';

export class AddressTestDataGenerator {
  public generateData(): Address {
    return {
      id: this.generateId(),
      createdAt: this.generateCreatedAt(),
      updatedAt: this.generateUpdatedAt(),
      firstName: this.generateFirstName(),
      lastName: this.generateLastName(),
      phoneNumber: this.generatePhoneNumber(),
      country: this.generateCountry(),
      state: this.generateState(),
      city: this.generateCity(),
      zipCode: this.generateZipCode(),
      streetAddress: this.generateStreetAddress(),
      deliveryInstructions: this.generateDeliveryInstructions(),
      customerId: this.generateCustomerId(),
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

  public generateFirstName(): string {
    return faker.name.firstName();
  }

  public generateLastName(): string {
    return faker.name.lastName();
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

  public generateDeliveryInstructions(): string {
    return faker.lorem.words();
  }

  public generateCustomerId(): string {
    return faker.datatype.uuid();
  }
}
