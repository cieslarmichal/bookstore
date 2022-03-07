import { AuthService } from '../../../app/controllers/shared';

export class AuthHelper {
  public mockAuth(authPayload: { userId: string; role: string }) {
    const fakeToken = 'token';

    jest.spyOn(AuthService.prototype, 'verifyAccessToken').mockImplementation(async (token) => {
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
