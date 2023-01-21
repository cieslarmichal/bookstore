import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CategoryAlreadyExists } from '../../../../../domain/category/errors/categoryAlreadyExists';
import { CategoryNotFound } from '../../../../../domain/category/errors/categoryNotFound';

export function categoryErrorMiddleware(error: Error, request: Request, response: Response, next: NextFunction) {
  if (error instanceof CategoryAlreadyExists) {
    response.status(StatusCodes.UNPROCESSABLE_ENTITY).send({ error: error.message });
    return;
  } else if (error instanceof CategoryNotFound) {
    response.status(StatusCodes.NOT_FOUND).send({ error: error.message });
    return;
  }

  next(error);
}
