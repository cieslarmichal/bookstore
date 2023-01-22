import { ApplicationError } from '../../../common/errors/applicationError';

type Context = {
  readonly userId: string;
  readonly targetUserId: string;
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
