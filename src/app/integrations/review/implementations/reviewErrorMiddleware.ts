/* eslint-disable @typescript-eslint/naming-convention */
import { NextFunction, Request, Response } from 'express';

import { HttpStatusCode } from '../../../common/http/contracts/httpStatusCode';
import { ReviewNotFoundError } from '../../../domain/review/errors/reviewNotFoundError';

export function reviewErrorMiddleware(error: Error, _request: Request, response: Response, next: NextFunction): void {
  if (error instanceof ReviewNotFoundError) {
    response.status(HttpStatusCode.notFound).send({ error: error.message });

    return;
  }

  next(error);
}
