import { NextFunction, Request, Response } from 'express';
import { ResponseSender } from '../shared';

export function errorMiddleware(error: Error, request: Request, response: Response, next: NextFunction) {
  let statusCode = 500;

  if (error.name === 'ValidationError' || error.name === 'BadRequestError') {
    statusCode = 400;
  } else if (error.name === 'NotFoundError') {
    statusCode = 404;
  }

  ResponseSender.sendJsonDataWithCode(response, { error: error.message }, statusCode);
}
