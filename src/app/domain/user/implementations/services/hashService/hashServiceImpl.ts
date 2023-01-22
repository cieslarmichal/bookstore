import { hash, compare, genSalt } from 'bcrypt';

import { HashService } from '../../../contracts/services/hashService/hashService';
import { UserModuleConfig } from '../../../userModuleConfig';

export class HashServiceImpl implements HashService {
  public constructor(private readonly userModuleConfig: UserModuleConfig) {}

  public async hash(plainData: string): Promise<string> {
    const salt = await this.generateSalt();

    return hash(plainData, salt);
  }

  public async compare(plainData: string, hashedData: string): Promise<boolean> {
    return compare(plainData, hashedData);
  }

  private async generateSalt(): Promise<string> {
    const { hashSaltRounds } = this.userModuleConfig;

    return genSalt(hashSaltRounds);
  }
}
