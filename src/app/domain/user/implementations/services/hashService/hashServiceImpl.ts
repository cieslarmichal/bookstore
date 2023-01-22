import { hash, compare, genSalt } from 'bcrypt';

import { HashService } from '../../../contracts/services/hashService/hashService';

export class HashServiceImpl implements HashService {
  public async hash(plainData: string): Promise<string> {
    const salt = await this.generateSalt();

    return hash(plainData, salt);
  }

  public async compare(plainData: string, hashedData: string): Promise<boolean> {
    return compare(plainData, hashedData);
  }

  private async generateSalt(): Promise<string> {
    const saltRounds = parseInt(process.env.HASH_SALT_ROUNDS as string);

    return genSalt(saltRounds);
  }
}
