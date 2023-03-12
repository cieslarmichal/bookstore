/* eslint-disable @typescript-eslint/naming-convention */
import { NextFunction, Request, Response } from 'express';

import { HttpStatusCode } from '../../../../common/http/contracts/httpStatusCode';
import { UserIsNotCustomerError } from '../errors/userIsNotCustomerError';

export function orderErrorMiddleware(error: Error, _request: Request, response: Response, next: NextFunction): void {
  if (error instanceof UserIsNotCustomerError) {
    response.status(HttpStatusCode.forbidden).send({ error: error.message });
    return;
  }

  next(error);
}
