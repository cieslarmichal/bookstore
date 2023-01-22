/* eslint-disable @typescript-eslint/naming-convention */
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { BookNotFoundError } from '../../../../../domain/book/errors/bookNotFoundError';
import { BookCategoryAlreadyExistsError } from '../../../../../domain/bookCategory/errors/bookCategoryAlreadyExistsError';
import { BookCategoryNotFoundError } from '../../../../../domain/bookCategory/errors/bookCategoryNotFoundError';
import { CategoryNotFoundError } from '../../../../../domain/category/errors/categoryNotFoundError';

export function bookCategoryErrorMiddleware(
  error: Error,
  _request: Request,
  response: Response,
  next: NextFunction,
): void {
  if (error instanceof BookCategoryAlreadyExistsError) {
    response.status(StatusCodes.UNPROCESSABLE_ENTITY).send({ error: error.message });
    return;
  } else if (
    error instanceof BookCategoryNotFoundError ||
    error instanceof BookNotFoundError ||
    error instanceof CategoryNotFoundError
  ) {
    response.status(StatusCodes.NOT_FOUND).send({ error: error.message });
    return;
  }

  next(error);
}
