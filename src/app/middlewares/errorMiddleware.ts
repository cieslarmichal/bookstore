import { NextFunction, Request, Response } from 'express';

export function errorMiddleware(error: Error, req: Request, res: Response, next: NextFunction) {
  if (error.name === 'ValidationError' || error.name === 'BadRequestError') {
    res.status(400);
  } else if (error.name === 'NotFoundError') {
    res.status(404);
  } else {
    res.status(500);
  }

  res.send({ error: error.message });
}
