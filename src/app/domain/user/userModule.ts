import { asClass, AwilixContainer } from 'awilix';
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
      [USER_MAPPER]: asClass(UserMapper),
      [USER_REPOSITORY]: asClass(UserRepository),
      [HASH_SERVICE]: asClass(HashService),
      [TOKEN_SERVICE]: asClass(TokenService),
      [USER_SERVICE]: asClass(UserService),
    });
  }
}
