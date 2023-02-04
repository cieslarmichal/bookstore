import { AwilixContainer } from 'awilix';

import { SpyFactory } from '../../../../common/tests/implementations/spyFactory';
import { userSymbols } from '../../../../domain/user/userSymbols';

export class AuthHelper {
  public constructor(private readonly spyFactory: SpyFactory, private readonly container: AwilixContainer) {}

  public mockAuth(authPayload: { userId: string; role: string }): unknown {
    const fakeToken = 'token';

    const tokenService = this.container.resolve(userSymbols.tokenService);

    this.spyFactory.create(tokenService, 'verifyAccessToken').mockImplementation(async (token) => {
      if (token !== fakeToken) {
        throw new Error('Invalid token.');
      }
      return {
        ...authPayload,
      };
    });

    return fakeToken;
  }
}
