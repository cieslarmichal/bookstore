import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { EmailAlreadySet, PhoneNumberAlreadySet, UserAlreadyExists, UserNotFound } from '../../../domain/user/errors';
import { UserFromTokenAuthPayloadNotMatchingTargetUser } from '../errors';

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
