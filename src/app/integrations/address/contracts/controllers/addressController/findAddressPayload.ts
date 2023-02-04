import { AccessTokenData } from '../../../../accessTokenData';

export interface FindAddressPayload {
  readonly id: string;
  readonly accessTokenData: AccessTokenData;
}
