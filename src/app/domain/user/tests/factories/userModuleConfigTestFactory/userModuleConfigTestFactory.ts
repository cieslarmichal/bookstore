import { faker } from '@faker-js/faker';

import { UserModuleConfig } from '../../../userModuleConfig';

export class UserModuleConfigTestFactory {
  public create(input: Partial<UserModuleConfig> = {}): UserModuleConfig {
    return {
      jwtSecret: faker.internet.password(),
      jwtExpiresIn: '1000000',
      hashSaltRounds: 6,
      ...input,
    };
  }
}
