import { AuthTokenData } from '../../../../authTokenData';

export interface FindAddressPayload {
  readonly id: string;
  readonly authTokenData: AuthTokenData;
}
