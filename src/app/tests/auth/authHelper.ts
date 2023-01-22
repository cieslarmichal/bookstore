import { AwilixContainer } from 'awilix';

import { userSymbols } from '../../domain/user/userSymbols';

export class AuthHelper {
  public constructor(private readonly container: AwilixContainer) {}

  public mockAuth(authPayload: { userId: string; role: string }): unknown {
    const fakeToken = 'token';

    const tokenService = this.container.resolve(userSymbols.tokenService);
    jest.spyOn(tokenService, 'verifyAccessToken').mockImplementation(async (token) => {
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
