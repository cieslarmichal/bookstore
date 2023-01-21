import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuthorNotFound } from '../../../../../domain/author/errors/authorNotFound';
import { AuthorBookAlreadyExists } from '../../../../../domain/authorBook/errors/authorBookAlreadyExists';
import { AuthorBookNotFound } from '../../../../../domain/authorBook/errors/authorBookNotFound';
import { BookNotFound } from '../../../../../domain/book/errors/bookNotFound';

export function authorBookErrorMiddleware(error: Error, request: Request, response: Response, next: NextFunction) {
  if (error instanceof AuthorBookAlreadyExists) {
    response.status(StatusCodes.UNPROCESSABLE_ENTITY).send({ error: error.message });
    return;
  } else if (error instanceof AuthorBookNotFound || error instanceof BookNotFound || error instanceof AuthorNotFound) {
    response.status(StatusCodes.NOT_FOUND).send({ error: error.message });
    return;
  }

  next(error);
}
