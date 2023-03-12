/* eslint-disable @typescript-eslint/naming-convention */
import { NextFunction, Request, Response } from 'express';

import { HttpStatusCode } from '../../../../common/http/contracts/httpStatusCode';
import { BookNotFoundError } from '../../../bookModule/infrastructure/errors/bookNotFoundError';
import { CategoryNotFoundError } from '../../../categoryModule/infrastructure/errors/categoryNotFoundError';
import { BookCategoryAlreadyExistsError } from '../errors/bookCategoryAlreadyExistsError';
import { BookCategoryNotFoundError } from '../errors/bookCategoryNotFoundError';

export function bookCategoryErrorMiddleware(
  error: Error,
  _request: Request,
  response: Response,
  next: NextFunction,
): void {
  if (error instanceof BookCategoryAlreadyExistsError) {
    response.status(HttpStatusCode.unprocessableEntity).send({ error: error.message });
    return;
  } else if (
    error instanceof BookCategoryNotFoundError ||
    error instanceof BookNotFoundError ||
    error instanceof CategoryNotFoundError
  ) {
    response.status(HttpStatusCode.notFound).send({ error: error.message });
    return;
  }

  next(error);
}
