import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { EmailAlreadySet } from '../../../../../domain/user/errors/emailAlreadySet';
import { PhoneNumberAlreadySet } from '../../../../../domain/user/errors/phoneNumberAlreadySet';
import { UserAlreadyExists } from '../../../../../domain/user/errors/userAlreadyExists';
import { UserNotFound } from '../../../../../domain/user/errors/userNotFound';
import { UserFromTokenAuthPayloadNotMatchingTargetUser } from '../../../errors/userFromTokenAuthPayloadNotMatchingTargetUser';

export function userErrorMiddleware(error: Error, request: Request, response: Response, next: NextFunction) {
  if (
    error instanceof UserAlreadyExists ||
    error instanceof EmailAlreadySet ||
    error instanceof PhoneNumberAlreadySet
  ) {
    response.status(StatusCodes.UNPROCESSABLE_ENTITY).send({ error: error.message });
    return;
  } else if (error instanceof UserNotFound) {
    response.status(StatusCodes.NOT_FOUND).send({ error: error.message });
    return;
  } else if (error instanceof UserFromTokenAuthPayloadNotMatchingTargetUser) {
    response.status(StatusCodes.FORBIDDEN).send({ error: error.message });
  }

  next(error);
}
