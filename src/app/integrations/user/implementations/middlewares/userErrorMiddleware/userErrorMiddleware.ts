/* eslint-disable @typescript-eslint/naming-convention */
import { NextFunction, Request, Response } from 'express';

import { HttpStatusCode } from '../../../../../common/http/contracts/httpStatusCode';
import { EmailAlreadySetError } from '../../../../../domain/user/errors/emailAlreadySetError';
import { PhoneNumberAlreadySetError } from '../../../../../domain/user/errors/phoneNumberAlreadySetError';
import { UserAlreadyExistsError } from '../../../../../domain/user/errors/userAlreadyExistsError';
import { UserNotFoundError } from '../../../../../domain/user/errors/userNotFoundError';
import { UserFromAccessTokenNotMatchingTargetUserError } from '../../../errors/userFromTokenAuthPayloadNotMatchingTargetUserError';

export function userErrorMiddleware(error: Error, _request: Request, response: Response, next: NextFunction): void {
  if (
    error instanceof UserAlreadyExistsError ||
    error instanceof EmailAlreadySetError ||
    error instanceof PhoneNumberAlreadySetError
  ) {
    response.status(HttpStatusCode.unprocessableEntity).send({ error: error.message });
    return;
  } else if (error instanceof UserNotFoundError) {
    response.status(HttpStatusCode.notFound).send({ error: error.message });
    return;
  } else if (error instanceof UserFromAccessTokenNotMatchingTargetUserError) {
    response.status(HttpStatusCode.forbidden).send({ error: error.message });
  }

  next(error);
}
