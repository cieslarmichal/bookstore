import { sign, verify } from 'jsonwebtoken';

import { TokenService } from '../../../contracts/services/tokenService/tokenService';

export class TokenServiceImpl implements TokenService {
  public async createToken(data: Record<string, string>): Promise<string> {
    const secret = process.env.JWT_SECRET as string;
    const expiresIn = process.env.JWT_EXPIRES_IN as string;

    return sign(data, secret, { expiresIn, algorithm: 'HS512' });
  }

  public async verifyToken(token: string): Promise<Record<string, string>> {
    const secret = process.env.JWT_SECRET as string;

    const data = verify(token, secret, { algorithms: ['HS512'] });

    return data as Record<string, string>;
  }
}
