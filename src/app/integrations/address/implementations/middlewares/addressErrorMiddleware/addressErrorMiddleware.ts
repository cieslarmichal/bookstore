import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { AddressNotFoundError } from '../../../../../domain/address/errors/addressNotFoundError';
import { CustomerFromAccessTokenNotMatchingCustomerFromAddressError } from '../../../errors/customerFromAccessTokenNotMatchingCustomerFromAddressError';
import { UserIsNotCustomerError } from '../../../errors/userIsNotCustomerError';

export function addressErrorMiddleware(error: Error, request: Request, response: Response, next: NextFunction): void {
  if (error instanceof AddressNotFoundError) {
    response.status(StatusCodes.NOT_FOUND).send({ error: error.message });
    return;
  } else if (
    error instanceof CustomerFromAccessTokenNotMatchingCustomerFromAddressError ||
    error instanceof UserIsNotCustomerError
  ) {
    response.status(StatusCodes.FORBIDDEN).send({ error: error.message });
  }

  next(error);
}
