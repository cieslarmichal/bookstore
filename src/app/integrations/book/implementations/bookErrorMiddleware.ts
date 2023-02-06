/* eslint-disable @typescript-eslint/naming-convention */
import { NextFunction, Request, Response } from 'express';

import { HttpStatusCode } from '../../../common/http/contracts/httpStatusCode';
import { BookNotFoundError } from '../../../domain/book/errors/bookNotFoundError';

export function bookErrorMiddleware(error: Error, _request: Request, response: Response, next: NextFunction): void {
  if (error instanceof BookNotFoundError) {
    response.status(HttpStatusCode.notFound).send({ error: error.message });
    return;
  }

  next(error);
}
