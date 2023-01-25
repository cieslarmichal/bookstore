/* eslint-disable @typescript-eslint/naming-convention */
import { NextFunction, Request, Response } from 'express';

import { HttpStatusCode } from '../../../common/http/httpStatusCode';
import { ValidationError } from '../../../common/validator/errors/validationError';

export function errorMiddleware(error: Error, _request: Request, response: Response, _next: NextFunction): void {
  let statusCode = HttpStatusCode.internalServerErrror;

  if (error instanceof ValidationError) {
    statusCode = HttpStatusCode.badRequest;
  }

  response.status(statusCode).send({ error: error.message });
}
