import { NextFunction, Request, Response } from 'express';
import { ControllerResponse } from './controllerResponse';

export function sendResponseMiddleware(request: Request, response: Response, next: NextFunction) {
  const controllerResponse: ControllerResponse = response.locals.controllerResponse;

  if (!controllerResponse) {
    next();
    return;
  }

  response.status(controllerResponse.statusCode);

  if (!controllerResponse.data) {
    response.send();
    return;
  }

  response.send({ data: controllerResponse.data });
}
