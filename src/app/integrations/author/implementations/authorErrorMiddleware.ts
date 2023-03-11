/* eslint-disable @typescript-eslint/naming-convention */
import { NextFunction, Request, Response } from 'express';

import { HttpStatusCode } from '../../../../common/http/contracts/httpStatusCode';
import { AuthorNotFoundError } from '../../../domain/author/errors/authorNotFoundError';

export function authorErrorMiddleware(error: Error, _request: Request, response: Response, next: NextFunction): void {
  if (error instanceof AuthorNotFoundError) {
    response.status(HttpStatusCode.notFound).send({ error: error.message });

    return;
  }

  next(error);
}
