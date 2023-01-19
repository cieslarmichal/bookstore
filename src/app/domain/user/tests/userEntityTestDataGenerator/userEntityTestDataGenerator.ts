import { UserEntity } from '../../contracts/userEntity';
import { faker } from '@faker-js/faker';
import { UserRole } from '../../contracts/userRole';

export class UserEntityTestDataGenerator {
  public generateData(): UserEntity {
    return {
      id: this.generateId(),
      createdAt: this.generateCreatedAt(),
      updatedAt: this.generateUpdatedAt(),
      email: this.generateEmail(),
      phoneNumber: this.generatePhoneNumber(),
      password: this.generatePassword(),
      role: this.generateRole(),
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

  public generateEmail(): string {
    return faker.internet.email();
  }

  public generatePhoneNumber(): string {
    return faker.phone.phoneNumber();
  }

  public generatePassword(): string {
    return faker.internet.password(24);
  }

  public generateRole(): UserRole {
    return UserRole.user;
  }
}
