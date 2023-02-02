import { NextFunction, Request, Response } from 'express';

import { HttpStatusCode } from '../../../common/http/httpStatusCode';
import { TokenService } from '../../../domain/user/contracts/services/tokenService/tokenService';
import { AuthTokenData } from '../../authTokenData';
import { LocalsName } from '../../localsName';

export class AuthMiddleware {
  public constructor(private readonly tokenService: TokenService) {}

  public async verifyToken(request: Request, response: Response, next: NextFunction): Promise<void> {
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
      const tokenPayload = await this.tokenService.verifyToken(token);

      const authTokenData = tokenPayload as unknown as AuthTokenData;

      if (!authTokenData) {
        response.status(HttpStatusCode.unauthorized).send({ error: 'Invalid access token' });

        return;
      }

      response.locals[LocalsName.authTokenData] = authTokenData;
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
