/* eslint-disable @typescript-eslint/naming-convention */
import { NextFunction, Request, Response } from 'express';

import { HttpStatusCode } from '../../../../common/http/httpStatusCode';
import { UserAlreadyExistsError } from '../../../userModule/infrastructure/errors/userAlreadyExistsError';
import { EmailAlreadySetError } from '../../domain/errors/emailAlreadySetError';
import { PhoneNumberAlreadySetError } from '../../domain/errors/phoneNumberAlreadySetError';
import { UserFromAccessTokenNotMatchingTargetUserError } from '../errors/userFromTokenAuthPayloadNotMatchingTargetUserError';
import { UserNotFoundError } from '../errors/userNotFoundError';

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
