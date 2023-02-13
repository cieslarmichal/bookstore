export interface TokenService {
  createToken(data: Record<string, string>): string;
  verifyToken(token: string): Record<string, string>;
}
