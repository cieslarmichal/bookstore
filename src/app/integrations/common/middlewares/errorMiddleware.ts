/* eslint-disable @typescript-eslint/naming-convention */
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { ValidationError } from '../../../common/validator/errors/validationError';

export function errorMiddleware(error: Error, _request: Request, response: Response, _next: NextFunction): void {
  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;

  if (error instanceof ValidationError) {
    statusCode = StatusCodes.BAD_REQUEST;
  }

  response.status(statusCode).send({ error: error.message });
}
