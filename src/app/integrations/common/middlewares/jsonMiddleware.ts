/* eslint-disable @typescript-eslint/naming-convention */
import { NextFunction, Request, Response } from 'express';

export function jsonMiddleware(_request: Request, response: Response, next: NextFunction): void {
  response.setHeader('Content-Type', 'application/json');

  next();
}
