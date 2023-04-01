/* eslint-disable @typescript-eslint/naming-convention */
import { NextFunction, Request, Response } from 'express';

import { HttpStatusCode } from '../../../../common/http/httpStatusCode';
import { WhishlistEntryAlreadyExistsError } from '../errors/whishlistEntryAlreadyExistsError';
import { WhishlistEntryNotFoundError } from '../errors/whishlistEntryNotFoundError';

export function whishlistErrorMiddleware(
  error: Error,
  _request: Request,
  response: Response,
  next: NextFunction,
): void {
  if (error instanceof WhishlistEntryNotFoundError) {
    response.status(HttpStatusCode.notFound).send({ error: error.message });

    return;
  }

  if (error instanceof WhishlistEntryAlreadyExistsError) {
    response.status(HttpStatusCode.unprocessableEntity).send({ error: error.message });

    return;
  }

  next(error);
}
