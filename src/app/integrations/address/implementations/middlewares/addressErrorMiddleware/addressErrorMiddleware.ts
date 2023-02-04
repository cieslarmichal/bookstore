/* eslint-disable @typescript-eslint/naming-convention */
import { NextFunction, Request, Response } from 'express';

import { HttpStatusCode } from '../../../../../common/http/contracts/httpStatusCode';
import { AddressNotFoundError } from '../../../../../domain/address/errors/addressNotFoundError';
import { CustomerFromAccessTokenNotMatchingCustomerFromAddressError } from '../../../errors/customerFromAccessTokenNotMatchingCustomerFromAddressError';
import { UserIsNotCustomerError } from '../../../errors/userIsNotCustomerError';

export function addressErrorMiddleware(error: Error, _request: Request, response: Response, next: NextFunction): void {
  if (error instanceof AddressNotFoundError) {
    response.status(HttpStatusCode.notFound).send({ error: error.message });
    return;
  } else if (
    error instanceof CustomerFromAccessTokenNotMatchingCustomerFromAddressError ||
    error instanceof UserIsNotCustomerError
  ) {
    response.status(HttpStatusCode.forbidden).send({ error: error.message });
  }

  next(error);
}
