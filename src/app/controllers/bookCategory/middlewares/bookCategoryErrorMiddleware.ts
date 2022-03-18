import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BookNotFound } from '../../../domain/book/errors';
import { BookCategoryAlreadyExists, BookCategoryNotFound } from '../../../domain/bookCategory/errors';
import { CategoryNotFound } from '../../../domain/category/errors';

export function bookCategoryErrorMiddleware(error: Error, request: Request, response: Response, next: NextFunction) {
  if (error instanceof BookCategoryAlreadyExists) {
    response.status(StatusCodes.UNPROCESSABLE_ENTITY).send({ error: error.message });
    return;
  } else if (
    error instanceof BookCategoryNotFound ||
    error instanceof BookNotFound ||
    error instanceof CategoryNotFound
  ) {
    response.status(StatusCodes.NOT_FOUND).send({ error: error.message });
    return;
  }

  next(error);
}
