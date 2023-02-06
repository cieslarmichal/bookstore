import { AccessTokenData } from '../../../../accessTokenData';

export interface FindUserPayload {
  readonly id: string;
  readonly accessTokenData: AccessTokenData;
}
