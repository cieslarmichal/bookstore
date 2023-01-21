import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuthorNotFound } from '../../../domain/author/errors';

export function authorErrorMiddleware(error: Error, request: Request, response: Response, next: NextFunction) {
  if (error instanceof AuthorNotFound) {
    response.status(StatusCodes.NOT_FOUND).send({ error: error.message });
    return;
  }

  next(error);
}
