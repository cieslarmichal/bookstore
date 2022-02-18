import { NextFunction, Request, Response } from 'express';

export function errorMiddleware(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (error.name == 'ValidationError') {
    res.status(400);
  } else {
    res.status(500);
  }
  res.send({ error: error.message });
}
