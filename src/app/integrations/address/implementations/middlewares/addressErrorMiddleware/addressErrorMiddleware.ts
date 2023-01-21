import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AddressNotFound } from '../../../../../domain/address/errors/addressNotFound';
import { CustomerFromTokenAuthPayloadNotMatchingCustomerFromAddress } from '../../../errors/customerFromTokenAuthPayloadNotMatchingCustomerFromAddress';
import { UserIsNotCustomer } from '../../../errors/userIsNotCustomer';

export function addressErrorMiddleware(error: Error, request: Request, response: Response, next: NextFunction) {
  if (error instanceof AddressNotFound) {
    response.status(StatusCodes.NOT_FOUND).send({ error: error.message });
    return;
  } else if (
    error instanceof CustomerFromTokenAuthPayloadNotMatchingCustomerFromAddress ||
    error instanceof UserIsNotCustomer
  ) {
    response.status(StatusCodes.FORBIDDEN).send({ error: error.message });
  }

  next(error);
}
