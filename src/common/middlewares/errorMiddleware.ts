/* eslint-disable @typescript-eslint/naming-convention */
import { NextFunction, Request, Response } from 'express';

import { ValidationError } from '../../libs/validator/errors/validationError';
import { HttpStatusCode } from '../http/httpStatusCode';

export function errorMiddleware(error: Error, _request: Request, response: Response, _next: NextFunction): void {
  let statusCode = HttpStatusCode.internalServerError;

  let errorContext: unknown | undefined = undefined;

  if (error instanceof ValidationError) {
    statusCode = HttpStatusCode.badRequest;

    errorContext = error.context;
  }

  const errorData = { name: error.name, message: error.message, context: errorContext };

  response.status(statusCode).send({ error: errorData });
}
