/* eslint-disable @typescript-eslint/naming-convention */
import { NextFunction, Request, Response } from 'express';

import { HttpStatusCode } from '../../../../../common/http/httpStatusCode';
import { CustomerAlreadyExistsError } from '../../../../../domain/customer/errors/customerAlreadyExistsError';
import { CustomerNotFoundError } from '../../../../../domain/customer/errors/customerNotFoundError';

export function customerErrorMiddleware(error: Error, _request: Request, response: Response, next: NextFunction): void {
  if (error instanceof CustomerAlreadyExistsError) {
    response.status(HttpStatusCode.unprocessableEntity).send({ error: error.message });
    return;
  } else if (error instanceof CustomerNotFoundError) {
    response.status(HttpStatusCode.notFound).send({ error: error.message });
    return;
  }

  next(error);
}
