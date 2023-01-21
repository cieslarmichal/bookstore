import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BookNotFound } from '../../../../../domain/book/errors/bookNotFound';

export function bookErrorMiddleware(error: Error, request: Request, response: Response, next: NextFunction) {
  if (error instanceof BookNotFound) {
    response.status(StatusCodes.NOT_FOUND).send({ error: error.message });
    return;
  }

  next(error);
}
