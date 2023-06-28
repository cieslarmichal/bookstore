import 'reflect-metadata';

import { UserHttpController } from './api/httpControllers/userHttpController/userHttpController';
import { UserRepositoryFactory } from './application/repositories/userRepository/userRepositoryFactory';
import { TokenService } from './application/services/tokenService/tokenService';
import { TokenServiceImpl } from './application/services/tokenService/tokenServiceImpl';
import { UserRepositoryFactoryImpl } from './infrastructure/repositories/userRepository/userRepositoryFactoryImpl';
import { userSymbols } from './symbols';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/dependencyInjectionContainer';
import { Application } from '../../application';

describe('UserModule', () => {
  let container: DependencyInjectionContainer;

  beforeAll(async () => {
    container = Application.createContainer();
  });

  it('declares bindings', async () => {
    expect(container.get<UserRepositoryFactory>(userSymbols.userRepositoryFactory)).toBeInstanceOf(
      UserRepositoryFactoryImpl,
    );

    expect(container.get<TokenService>(userSymbols.tokenService)).toBeInstanceOf(TokenServiceImpl);

    expect(container.get<UserHttpController>(userSymbols.userHttpController)).toBeInstanceOf(UserHttpController);
  });
});
