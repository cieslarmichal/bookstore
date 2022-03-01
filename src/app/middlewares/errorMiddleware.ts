import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export function errorMiddleware(error: Error, request: Request, response: Response, next: NextFunction) {
  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;

  if (error.name === 'ValidationError' || error.name === 'BadRequestError') {
    statusCode = StatusCodes.BAD_REQUEST;
  } else if (error.name === 'NotFoundError') {
    statusCode = StatusCodes.NOT_FOUND;
  }

  response.setHeader('Content-Type', 'application/json');
  response.status(statusCode).send({ error: error.message });
}
