import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { CustomerAlreadyExistsError } from '../../../../../domain/customer/errors/customerAlreadyExistsError';
import { CustomerNotFoundError } from '../../../../../domain/customer/errors/customerNotFoundError';

export function customerErrorMiddleware(error: Error, request: Request, response: Response, next: NextFunction): void {
  if (error instanceof CustomerAlreadyExistsError) {
    response.status(StatusCodes.UNPROCESSABLE_ENTITY).send({ error: error.message });
    return;
  } else if (error instanceof CustomerNotFoundError) {
    response.status(StatusCodes.NOT_FOUND).send({ error: error.message });
    return;
  }

  next(error);
}
