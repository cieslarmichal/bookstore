import { AccessTokenData } from '../../../../accessTokenData';

export interface SetUserPhoneNumberPayload {
  readonly userId: string;
  readonly phoneNumber: string;
  readonly accessTokenData: AccessTokenData;
}
