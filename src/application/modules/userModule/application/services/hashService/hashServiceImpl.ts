import { hash, compare, genSalt } from 'bcrypt';

import { HashService } from './hashService';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { symbols } from '../../../symbols';
import { UserModuleConfig } from '../../../userModuleConfig';

@Injectable()
export class HashServiceImpl implements HashService {
  public constructor(
    @Inject(symbols.userModuleConfig)
    private readonly userModuleConfig: UserModuleConfig,
  ) {}

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
