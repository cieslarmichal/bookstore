/* eslint-disable @typescript-eslint/naming-convention */
import { NextFunction, Request, Response } from 'express';

import { HttpStatusCode } from '../../../../../common/http/httpStatusCode';
import { CartNotFoundError } from '../../errors/cartNotFoundError';
import { CustomerFromAccessTokenNotMatchingCustomerFromCartError } from '../../errors/customerFromAccessTokenNotMatchingCustomerFromCartError';
import { UserIsNotCustomerError } from '../../errors/userIsNotCustomerError';

export function cartErrorMiddleware(error: Error, _request: Request, response: Response, next: NextFunction): void {
  if (error instanceof CartNotFoundError) {
    response.status(HttpStatusCode.notFound).send({ error: error.message });

    return;
  } else if (
    error instanceof CustomerFromAccessTokenNotMatchingCustomerFromCartError ||
    error instanceof UserIsNotCustomerError
  ) {
    response.status(HttpStatusCode.forbidden).send({ error: error.message });

    return;
  }

  next(error);
}
