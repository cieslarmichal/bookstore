import { asClass, AwilixContainer, Lifetime } from 'awilix';
import { LoadableModule } from '../../shared';
import { HASH_SERVICE, TOKEN_SERVICE, USER_MAPPER, USER_REPOSITORY, USER_SERVICE } from './userInjectionSymbols';
import { UserMapper } from './mappers/userMapper';
import { UserRepository } from './repositories/userRepository';
import { UserService } from './services/userService';
import { HashService } from './services/hashService';
import { TokenService } from './services/tokenService';

export class UserModule extends LoadableModule {
  public override async loadDependenciesIntoDIContainer(container: AwilixContainer): Promise<void> {
    container.register({
      [USER_MAPPER]: asClass(UserMapper, { lifetime: Lifetime.SINGLETON }),
      [USER_REPOSITORY]: asClass(UserRepository, { lifetime: Lifetime.SINGLETON }),
      [HASH_SERVICE]: asClass(HashService, { lifetime: Lifetime.SINGLETON }),
      [TOKEN_SERVICE]: asClass(TokenService, { lifetime: Lifetime.SINGLETON }),
      [USER_SERVICE]: asClass(UserService, { lifetime: Lifetime.SINGLETON }),
    });
  }
}
