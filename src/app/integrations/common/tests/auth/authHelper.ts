import { TokenService } from '../../../../domain/user/contracts/services/tokenService/tokenService';
import { userSymbols } from '../../../../domain/user/userSymbols';
import { DependencyInjectionContainer } from '../../../../libs/dependencyInjection/implementations/dependencyInjectionContainer';

export class AuthHelper {
  public constructor(private readonly container: DependencyInjectionContainer) {}

  public mockAuth(authPayload: { userId: string; role: string }): unknown {
    const fakeToken = 'token';

    const tokenService = this.container.get<TokenService>(userSymbols.tokenService);

    jest.spyOn(tokenService, 'verifyToken').mockImplementation(async (token) => {
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
