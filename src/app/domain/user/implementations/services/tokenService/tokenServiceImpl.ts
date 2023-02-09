import { sign, verify } from 'jsonwebtoken';

import { Injectable, Inject } from '../../../../../libs/dependencyInjection/contracts/decorators';
import { TokenService } from '../../../contracts/services/tokenService/tokenService';
import { UserModuleConfig } from '../../../userModuleConfig';
import { userSymbols } from '../../../userSymbols';

@Injectable()
export class TokenServiceImpl implements TokenService {
  public constructor(
    @Inject(userSymbols.userModuleConfig)
    private readonly userModuleConfig: UserModuleConfig,
  ) {}

  public async createToken(data: Record<string, string>): Promise<string> {
    const { jwtSecret, jwtExpiresIn } = this.userModuleConfig;

    return sign(data, jwtSecret, { expiresIn: jwtExpiresIn, algorithm: 'HS512' });
  }

  public async verifyToken(token: string): Promise<Record<string, string>> {
    const { jwtSecret } = this.userModuleConfig;

    const data = verify(token, jwtSecret, { algorithms: ['HS512'] });

    return data as Record<string, string>;
  }
}
