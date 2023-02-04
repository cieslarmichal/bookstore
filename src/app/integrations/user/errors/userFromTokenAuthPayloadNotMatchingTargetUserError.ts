import { ApplicationError } from '../../../common/errors/applicationError';
import { AccessTokenData } from '../../accessTokenData';

type Context = {
  readonly userId: string;
  readonly accessTokenData: AccessTokenData;
};

export class UserFromAccessTokenNotMatchingTargetUserError extends ApplicationError<Context> {
  public constructor(context: Context) {
    super(
      'UserFromAccessTokenNotMatchingTargetUser',
      `User id from access token's payload does not match target user id.`,
      context,
    );
  }
}
