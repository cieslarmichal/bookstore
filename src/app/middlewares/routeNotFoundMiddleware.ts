import { NextFunction, Request, Response } from 'express';
import { NotFoundError } from '../shared';

export function routeNotFoundMiddleware(request: Request, response: Response, next: NextFunction) {
  next(new NotFoundError(`Endpoint '${request.url}' not found`));
}
