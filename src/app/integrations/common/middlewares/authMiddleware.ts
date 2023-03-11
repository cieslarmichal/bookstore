import { NextFunction, Request, Response } from 'express';

import { HttpStatusCode } from '../../../../common/http/contracts/httpStatusCode';
import { TokenService } from '../../../domain/user/contracts/services/tokenService/tokenService';
import { userSymbols } from '../../../domain/user/userSymbols';
import { Inject, Injectable } from '../../../../libs/dependencyInjection/contracts/decorators';
import { AccessTokenData } from '../../accessTokenData';
import { LocalsName } from '../../localsName';

@Injectable()
export class AuthMiddleware {
  public constructor(
    @Inject(userSymbols.tokenService)
    private readonly tokenService: TokenService,
  ) {}

  public verifyToken(request: Request, response: Response, next: NextFunction): void {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      response.status(HttpStatusCode.unauthorized).send({ error: 'Authorization header not provided' });

      return;
    }

    const token = this.parseToken(authHeader as string);

    if (!token) {
      response.status(HttpStatusCode.unauthorized).send({ error: 'Bearer authorization is not set' });

      return;
    }

    try {
      const tokenPayload = this.tokenService.verifyToken(token);

      const accessTokenData = tokenPayload as unknown as AccessTokenData;

      if (!accessTokenData) {
        response.status(HttpStatusCode.unauthorized).send({ error: 'Invalid access token' });

        return;
      }

      response.locals[LocalsName.accessTokenData] = accessTokenData;
    } catch (error) {
      response.status(HttpStatusCode.unauthorized).send({ error: 'Invalid access token' });

      return;
    }

    next();
  }

  private parseToken(authHeaderContent: string): string | undefined {
    const [authType, token] = authHeaderContent.split(' ');

    if (authType !== 'Bearer') {
      return undefined;
    }

    return token;
  }
}
