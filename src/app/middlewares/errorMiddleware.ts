import { NextFunction, Request, Response } from 'express';

export function errorMiddleware(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  res.status(500).send(`Unexpected error: ${error.message}`);
}
