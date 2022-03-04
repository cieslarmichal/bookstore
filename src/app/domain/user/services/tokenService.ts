import jwt from 'jsonwebtoken';

export type Token = string;

export class TokenService {
  public async createToken(data: Record<string, string>): Promise<Token> {
    const secret = process.env.JWT_SECRET as string;
    const expiresIn = process.env.JWT_EXPIRES_IN as string;

    return jwt.sign(data, secret, { expiresIn, algorithm: 'HS512' });
  }

  public async verifyToken(token: Token): Promise<Record<string, string>> {
    const secret = process.env.JWT_SECRET as string;

    const data = jwt.verify(token, secret, { algorithms: ['HS512'] });

    return data as Record<string, string>;
  }
}
