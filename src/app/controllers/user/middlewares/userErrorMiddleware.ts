import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UserAlreadyExists, UserNotFound } from '../../../domain/user/errors';

export function userErrorMiddleware(error: Error, request: Request, response: Response, next: NextFunction) {
  if (error instanceof UserAlreadyExists) {
    response.status(StatusCodes.UNPROCESSABLE_ENTITY).send({ error: error.message });
    return;
  } else if (error instanceof UserNotFound) {
    response.status(StatusCodes.NOT_FOUND).send({ error: error.message });
    return;
  }

  next(error);
}
