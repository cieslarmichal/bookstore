import { AccessTokenData } from '../../../../accessTokenData';

export interface SetUserPasswordPayload {
  readonly userId: string;
  readonly password: string;
  readonly accessTokenData: AccessTokenData;
}
