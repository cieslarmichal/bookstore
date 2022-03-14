import { AwilixContainer } from 'awilix';
import { AUTH_SERVICE } from '../../../app/controllers/controllersInjectionSymbols';

export class AuthHelper {
  public constructor(private readonly container: AwilixContainer) {}

  public mockAuth(authPayload: { userId: string; role: string }) {
    const fakeToken = 'token';

    const authService = this.container.resolve(AUTH_SERVICE);
    jest.spyOn(authService, 'verifyAccessToken').mockImplementation(async (token) => {
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
