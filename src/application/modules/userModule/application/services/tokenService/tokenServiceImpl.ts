import { sign, verify } from 'jsonwebtoken';

import { TokenService } from './tokenService';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { UserModuleConfig } from '../../../userModuleConfig';
import { userModuleSymbols } from '../../../userModuleSymbols';

@Injectable()
export class TokenServiceImpl implements TokenService {
  public constructor(
    @Inject(userModuleSymbols.userModuleConfig)
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
