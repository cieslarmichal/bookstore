import { TokenService } from '../../../domain/user/services/tokenService';

export class AuthService {
  public constructor(private readonly tokenService: TokenService) {}

  public verifyAccessToken(accessToken: string): Promise<Record<string, string>> {
    return this.tokenService.verifyToken(accessToken);
  }
}
