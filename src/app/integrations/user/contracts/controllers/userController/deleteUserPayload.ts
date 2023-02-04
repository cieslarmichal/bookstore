import { AccessTokenData } from '../../../../accessTokenData';

export interface DeleteUserPayload {
  readonly id: string;
  readonly accessTokenData: AccessTokenData;
}
