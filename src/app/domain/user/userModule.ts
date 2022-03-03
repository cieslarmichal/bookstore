import { asClass, AwilixContainer } from 'awilix';
import { LoadableModule } from '../../shared';
import { USER_MAPPER, USER_REPOSITORY, USER_SERVICE } from './userInjectionSymbols';
import { UserMapper } from './mappers/userMapper';
import { UserRepository } from './repositories/userRepository';
import { UserService } from './services/userService';

export class UserModule extends LoadableModule {
  public override async loadDependenciesIntoDIContainer(container: AwilixContainer): Promise<void> {
    container.register({
      [USER_MAPPER]: asClass(UserMapper),
      [USER_REPOSITORY]: asClass(UserRepository),
      [USER_SERVICE]: asClass(UserService),
    });
  }
}
