/* eslint-disable @typescript-eslint/naming-convention */
import { NextFunction, Request, Response } from 'express';

import { HttpStatusCode } from '../../../../../common/http/contracts/httpStatusCode';
import { AuthorNotFoundError } from '../../../../../domain/author/errors/authorNotFoundError';
import { AuthorBookAlreadyExistsError } from '../../../../../domain/authorBook/errors/authorBookAlreadyExistsError';
import { AuthorBookNotFoundError } from '../../../../../domain/authorBook/errors/authorBookNotFoundError';
import { BookNotFoundError } from '../../../../../domain/book/errors/bookNotFoundError';

export function authorBookErrorMiddleware(
  error: Error,
  _request: Request,
  response: Response,
  next: NextFunction,
): void {
  if (error instanceof AuthorBookAlreadyExistsError) {
    response.status(HttpStatusCode.unprocessableEntity).send({ error: error.message });
    return;
  } else if (
    error instanceof AuthorBookNotFoundError ||
    error instanceof BookNotFoundError ||
    error instanceof AuthorNotFoundError
  ) {
    response.status(HttpStatusCode.notFound).send({ error: error.message });
    return;
  }

  next(error);
}
