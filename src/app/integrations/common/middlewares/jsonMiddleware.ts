import { NextFunction, Request, Response } from 'express';

export function jsonMiddleware(equest: Request, response: Response, next: NextFunction) {
  response.setHeader('Content-Type', 'application/json');

  next();
}
