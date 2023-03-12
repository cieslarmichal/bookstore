/* eslint-disable @typescript-eslint/naming-convention */
import { NextFunction, Request, Response } from 'express';

import { HttpStatusCode } from '../../../../common/http/contracts/httpStatusCode';
import { InventoryAlreadyExistsError } from '../errors/inventoryAlreadyExistsError';
import { InventoryNotFoundError } from '../errors/inventoryNotFoundError';

export function inventoryErrorMiddleware(
  error: Error,
  _request: Request,
  response: Response,
  next: NextFunction,
): void {
  if (error instanceof InventoryNotFoundError) {
    response.status(HttpStatusCode.notFound).send({ error: error.message });

    return;
  }

  if (error instanceof InventoryAlreadyExistsError) {
    response.status(HttpStatusCode.unprocessableEntity).send({ error: error.message });

    return;
  }

  next(error);
}
