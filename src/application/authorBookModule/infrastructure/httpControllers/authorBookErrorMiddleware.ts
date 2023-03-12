/* eslint-disable @typescript-eslint/naming-convention */
import { NextFunction, Request, Response } from 'express';

import { HttpStatusCode } from '../../../../common/http/httpStatusCode';
import { AuthorNotFoundError } from '../../../authorModule/infrastructure/errors/authorNotFoundError';
import { BookNotFoundError } from '../../../bookModule/infrastructure/errors/bookNotFoundError';
import { AuthorBookAlreadyExistsError } from '../errors/authorBookAlreadyExistsError';
import { AuthorBookNotFoundError } from '../errors/authorBookNotFoundError';

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
