import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CustomerAlreadyExists, CustomerNotFound } from '../../../domain/customer/errors';

export function customerErrorMiddleware(error: Error, request: Request, response: Response, next: NextFunction) {
  if (error instanceof CustomerAlreadyExists) {
    response.status(StatusCodes.UNPROCESSABLE_ENTITY).send({ error: error.message });
    return;
  } else if (error instanceof CustomerNotFound) {
    response.status(StatusCodes.NOT_FOUND).send({ error: error.message });
    return;
  }

  next(error);
}
