import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BookAlreadyExists, BookNotFound } from '../../../domain/book/errors';

export function bookErrorMiddleware(error: Error, request: Request, response: Response, next: NextFunction) {
  if (error instanceof BookAlreadyExists) {
    response.setHeader('Content-Type', 'application/json');
    response.status(StatusCodes.UNPROCESSABLE_ENTITY).send({ error: error.message });
  } else if (error instanceof BookNotFound) {
    response.setHeader('Content-Type', 'application/json');
    response.status(StatusCodes.NOT_FOUND).send({ error: error.message });
  }

  next(error);
}
