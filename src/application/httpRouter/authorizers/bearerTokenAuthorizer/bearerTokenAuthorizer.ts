import { AuthorizationType } from '../../../../common/http/authorizationType';
import { Injectable, Inject } from '../../../../libs/dependencyInjection/decorators';
import { TokenService } from '../../../modules/userModule/application/services/tokenService/tokenService';
import { userSymbols } from '../../../modules/userModule/symbols';
import { BearerTokenAuthorizationError } from '../errors/bearerTokenAuthorizationError';

export interface AccessTokenData {
  readonly userId: string;
}

@Injectable()
export class BearerTokenAuthorizer {
  public constructor(
    @Inject(userSymbols.tokenService)
    private readonly tokenService: TokenService,
  ) {}

  public extractAuthorizationContextFromAuthorizationHeader(authorizationHeader: string | undefined): AccessTokenData {
    if (!authorizationHeader) {
      throw new BearerTokenAuthorizationError({ reason: 'Authorization header not provided.' });
    }

    const [authorizationType, token] = authorizationHeader.split(' ');

    if (authorizationType !== AuthorizationType.bearerToken) {
      throw new BearerTokenAuthorizationError({
        authorizationHeader: authorizationHeader,
        reason: 'Bearer authorization type not set.',
      });
    }

    try {
      const accessTokenData = this.tokenService.verifyToken(token as string) as unknown as AccessTokenData;

      if (!accessTokenData) {
        throw new BearerTokenAuthorizationError({
          authorizationHeader: authorizationHeader,
          reason: 'Invalid access token',
        });
      }

      return accessTokenData;
    } catch (error) {
      throw new BearerTokenAuthorizationError({
        authorizationHeader: authorizationHeader,
        reason: 'Invalid access token',
      });
    }
  }
}
