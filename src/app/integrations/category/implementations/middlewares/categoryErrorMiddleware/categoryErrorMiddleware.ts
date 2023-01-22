/* eslint-disable @typescript-eslint/naming-convention */
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { CategoryAlreadyExistsError } from '../../../../../domain/category/errors/categoryAlreadyExistsError';
import { CategoryNotFoundError } from '../../../../../domain/category/errors/categoryNotFoundError';

export function categoryErrorMiddleware(error: Error, _request: Request, response: Response, next: NextFunction): void {
  if (error instanceof CategoryAlreadyExistsError) {
    response.status(StatusCodes.UNPROCESSABLE_ENTITY).send({ error: error.message });
    return;
  } else if (error instanceof CategoryNotFoundError) {
    response.status(StatusCodes.NOT_FOUND).send({ error: error.message });
    return;
  }

  next(error);
}
