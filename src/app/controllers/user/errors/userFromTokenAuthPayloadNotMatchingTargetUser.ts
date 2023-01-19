import { ApplicationError } from '../../../common';

type UserFromTokenAuthPayloadNotMatchingTargetUserContext = {
  readonly userId: string;
  readonly targetUserId: string;
};

export class UserFromTokenAuthPayloadNotMatchingTargetUser extends ApplicationError<UserFromTokenAuthPayloadNotMatchingTargetUserContext> {
  public constructor(context: UserFromTokenAuthPayloadNotMatchingTargetUserContext) {
    super(`User id from access token's payload does not match target user id.`, context);
  }
}
