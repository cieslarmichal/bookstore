/* eslint-disable @typescript-eslint/naming-convention */
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

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
    response.status(StatusCodes.UNPROCESSABLE_ENTITY).send({ error: error.message });
    return;
  } else if (error instanceof UserNotFoundError) {
    response.status(StatusCodes.NOT_FOUND).send({ error: error.message });
    return;
  } else if (error instanceof UserFromAccessTokenNotMatchingTargetUserError) {
    response.status(StatusCodes.FORBIDDEN).send({ error: error.message });
  }

  next(error);
}
