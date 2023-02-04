import { faker } from '@faker-js/faker';

import { UserModuleConfig } from '../../../userModuleConfig';

export class UserModuleConfigTestFactory {
  public create(input: Partial<UserModuleConfig> = {}): UserModuleConfig {
    return {
      jwtSecret: faker.internet.password(),
      jwtExpiresIn: faker.datatype.number({ max: 10000 }).toString(),
      hashSaltRounds: faker.datatype.number({ max: 10, min: 5 }),
      ...input,
    };
  }
}
