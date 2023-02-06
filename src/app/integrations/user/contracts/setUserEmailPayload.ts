import { AccessTokenData } from '../../../../accessTokenData';

export interface SetUserEmailPayload {
  readonly userId: string;
  readonly email: string;
  readonly accessTokenData: AccessTokenData;
}
