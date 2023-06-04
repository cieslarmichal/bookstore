import { sign, verify } from 'jsonwebtoken';

import { TokenService } from './tokenService';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { userSymbols } from '../../../symbols';
import { UserModuleConfig } from '../../../userModuleConfig';

@Injectable()
export class TokenServiceImpl implements TokenService {
  public constructor(
    @Inject(userSymbols.userModuleConfig)
    private readonly userModuleConfig: UserModuleConfig,
  ) {}

  public createToken(data: Record<string, string>): string {
    const { jwtSecret, jwtExpiresIn } = this.userModuleConfig;

    const token = sign(data, jwtSecret, { expiresIn: jwtExpiresIn, algorithm: 'HS512' });

    return token;
  }

  public verifyToken(token: string): Record<string, string> {
    const { jwtSecret } = this.userModuleConfig;

    const data = verify(token, jwtSecret, { algorithms: ['HS512'] });

    return data as Record<string, string>;
  }
}
