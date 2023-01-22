import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { BookNotFoundError } from '../../../../../domain/book/errors/bookNotFoundError';

export function bookErrorMiddleware(error: Error, request: Request, response: Response, next: NextFunction): void {
  if (error instanceof BookNotFoundError) {
    response.status(StatusCodes.NOT_FOUND).send({ error: error.message });
    return;
  }

  next(error);
}
