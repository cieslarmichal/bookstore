import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { AuthorNotFoundError } from '../../../../../domain/author/errors/authorNotFoundError';
import { AuthorBookAlreadyExistsError } from '../../../../../domain/authorBook/errors/authorBookAlreadyExistsError';
import { AuthorBookNotFoundError } from '../../../../../domain/authorBook/errors/authorBookNotFoundError';
import { BookNotFoundError } from '../../../../../domain/book/errors/bookNotFoundError';

export function authorBookErrorMiddleware(
  error: Error,
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  if (error instanceof AuthorBookAlreadyExistsError) {
    response.status(StatusCodes.UNPROCESSABLE_ENTITY).send({ error: error.message });
    return;
  } else if (
    error instanceof AuthorBookNotFoundError ||
    error instanceof BookNotFoundError ||
    error instanceof AuthorNotFoundError
  ) {
    response.status(StatusCodes.NOT_FOUND).send({ error: error.message });
    return;
  }

  next(error);
}
