import { UserHttpController } from './api/httpControllers/userHttpController/userHttpController';
import { DeleteUserCommandHandler } from './application/commandHandlers/deleteUserCommandHandler/deleteUserCommandHandler';
import { DeleteUserCommandHandlerImpl } from './application/commandHandlers/deleteUserCommandHandler/deleteUserCommandHandlerImpl';
import { LoginUserCommandHandler } from './application/commandHandlers/loginUserCommandHandler/loginUserCommandHandler';
import { LoginUserCommandHandlerImpl } from './application/commandHandlers/loginUserCommandHandler/loginUserCommandHandlerImpl';
import { RegisterUserCommandHandler } from './application/commandHandlers/registerUserCommandHandler/registerUserCommandHandler';
import { RegisterUserCommandHandlerImpl } from './application/commandHandlers/registerUserCommandHandler/registerUserCommandHandlerImpl';
import { SetUserEmailCommandHandler } from './application/commandHandlers/setUserEmailCommandHandler/setUserEmailCommandHandler';
import { SetUserEmailCommandHandlerImpl } from './application/commandHandlers/setUserEmailCommandHandler/setUserEmailCommandHandlerImpl';
import { SetUserPasswordCommandHandler } from './application/commandHandlers/setUserPasswordCommandHandler/setUserPasswordCommandHandler';
import { SetUserPasswordCommandHandlerImpl } from './application/commandHandlers/setUserPasswordCommandHandler/setUserPasswordCommandHandlerImpl';
import { SetUserPhoneNumberCommandHandler } from './application/commandHandlers/setUserPhoneNumberCommandHandler/setUserPhoneNumberCommandHandler';
import { SetUserPhoneNumberCommandHandlerImpl } from './application/commandHandlers/setUserPhoneNumberCommandHandler/setUserPhoneNumberCommandHandlerImpl';
import { FindUserQueryHandler } from './application/queryHandlers/findUserQueryHandler/findUserQueryHandler';
import { FindUserQueryHandlerImpl } from './application/queryHandlers/findUserQueryHandler/findUserQueryHandlerImpl';
import { UserRepositoryFactory } from './application/repositories/userRepository/userRepositoryFactory';
import { HashService } from './application/services/hashService/hashService';
import { HashServiceImpl } from './application/services/hashService/hashServiceImpl';
import { TokenService } from './application/services/tokenService/tokenService';
import { TokenServiceImpl } from './application/services/tokenService/tokenServiceImpl';
import { UserMapper } from './infrastructure/repositories/userRepository/userMapper/userMapper';
import { UserMapperImpl } from './infrastructure/repositories/userRepository/userMapper/userMapperImpl';
import { UserRepositoryFactoryImpl } from './infrastructure/repositories/userRepository/userRepositoryFactoryImpl';
import { symbols, userSymbols } from './symbols';
import { UserModuleConfig } from './userModuleConfig';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/dependencyInjectionContainer';
import { DependencyInjectionModule } from '../../../libs/dependencyInjection/dependencyInjectionModule';

export class UserModule implements DependencyInjectionModule {
  public constructor(private readonly config: UserModuleConfig) {}

  public declareBindings(container: DependencyInjectionContainer): void {
    container.bindToValue<UserModuleConfig>(symbols.userModuleConfig, this.config);

    container.bindToConstructor<UserMapper>(symbols.userMapper, UserMapperImpl);

    container.bindToConstructor<UserRepositoryFactory>(userSymbols.userRepositoryFactory, UserRepositoryFactoryImpl);

    container.bindToConstructor<RegisterUserCommandHandler>(
      symbols.registerUserCommandHandler,
      RegisterUserCommandHandlerImpl,
    );

    container.bindToConstructor<LoginUserCommandHandler>(symbols.loginUserCommandHandler, LoginUserCommandHandlerImpl);

    container.bindToConstructor<DeleteUserCommandHandler>(
      symbols.deleteUserCommandHandler,
      DeleteUserCommandHandlerImpl,
    );

    container.bindToConstructor<SetUserPhoneNumberCommandHandler>(
      symbols.setUserPhoneNumberCommandHandler,
      SetUserPhoneNumberCommandHandlerImpl,
    );

    container.bindToConstructor<SetUserEmailCommandHandler>(
      symbols.setUserEmailCommandHandler,
      SetUserEmailCommandHandlerImpl,
    );

    container.bindToConstructor<SetUserPasswordCommandHandler>(
      symbols.setUserPasswordCommandHandler,
      SetUserPasswordCommandHandlerImpl,
    );

    container.bindToConstructor<FindUserQueryHandler>(symbols.findUserQueryHandler, FindUserQueryHandlerImpl);

    container.bindToConstructor<HashService>(symbols.hashService, HashServiceImpl);

    container.bindToConstructor<TokenService>(symbols.tokenService, TokenServiceImpl);

    container.bindToConstructor<UserHttpController>(symbols.userHttpController, UserHttpController);
  }
}
