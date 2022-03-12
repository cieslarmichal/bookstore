import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuthorBookAlreadyExists, AuthorBookNotFound } from '../../../domain/authorBook/errors';

export function authorBookErrorMiddleware(error: Error, request: Request, response: Response, next: NextFunction) {
  if (error instanceof AuthorBookAlreadyExists) {
    response.status(StatusCodes.UNPROCESSABLE_ENTITY).send({ error: error.message });
    return;
  } else if (error instanceof AuthorBookNotFound) {
    response.status(StatusCodes.NOT_FOUND).send({ error: error.message });
    return;
  }

  next(error);
}
