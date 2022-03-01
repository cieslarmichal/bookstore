import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuthorNotFound } from '../../../domain/author/errors';

export function authorErrorMiddleware(error: Error, request: Request, response: Response, next: NextFunction) {
  if (error instanceof AuthorNotFound) {
    response.setHeader('Content-Type', 'application/json');
    response.status(StatusCodes.NOT_FOUND).send({ error: error.message });
  }

  next(error);
}
