import { NextFunction, Request, Response } from 'express';

export function jsonMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  res.contentType('application/json');
  next();
}
