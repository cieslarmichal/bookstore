import { User } from '../entities/user';
import { faker } from '@faker-js/faker';
import { UserRole } from '../types';

export class UserTestDataGenerator {
  public generateData(): User {
    return {
      id: this.generateId(),
      createdAt: this.generateCreatedAt(),
      updatedAt: this.generateUpdatedAt(),
      email: this.generateEmail(),
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
    return faker.lorem.text(10);
  }

  public generatePassword(): string {
    return faker.datatype.uuid();
  }

  public generateRole(): UserRole {
    return faker.helpers.randomize([UserRole.user, UserRole.admin]);
  }
}
