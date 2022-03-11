import { AwilixContainer } from 'awilix';

export class AuthHelper {
  public constructor(private readonly container: AwilixContainer) {}

  public mockAuth(authPayload: { userId: string; role: string }) {
    const fakeToken = 'token';

    const authService = this.container.resolve('authService');
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
