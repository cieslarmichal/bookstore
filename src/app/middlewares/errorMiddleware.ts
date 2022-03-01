import { ValidationError } from 'class-validator';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export function errorMiddleware(error: Error, request: Request, response: Response, next: NextFunction) {
  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;

  if (error instanceof ValidationError) {
    statusCode = StatusCodes.BAD_REQUEST;
  }

  response.status(statusCode).send({ error: error.message });
}
