export interface HashService {
  hash(plainData: string): Promise<string>;
  compare(plainData: string, hashedData: string): Promise<boolean>;
}
