import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { AuthorNotFoundError } from '../../../../../domain/author/errors/authorNotFoundError';

export function authorErrorMiddleware(error: Error, request: Request, response: Response, next: NextFunction): void {
  if (error instanceof AuthorNotFoundError) {
    response.status(StatusCodes.NOT_FOUND).send({ error: error.message });

    return;
  }

  next(error);
}
