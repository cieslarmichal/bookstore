export interface TokenService {
  createToken(data: Record<string, string>): Promise<string>;
  verifyToken(token: string): Promise<Record<string, string>>;
}
