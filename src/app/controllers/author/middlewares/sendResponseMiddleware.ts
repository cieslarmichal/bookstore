import { NextFunction, Request, Response } from 'express';
import { ControllerResponse } from '../../shared/controllerResponse';

export function sendResponseMiddleware(request: Request, response: Response, next: NextFunction) {
  const controllerResponse: ControllerResponse = response.locals.controllerResponse;

  if (!controllerResponse) {
    next();
  }

  response.status(controllerResponse.statusCode);

  if (controllerResponse.data) {
    response.send({ data: controllerResponse.data });
  } else {
    response.send();
  }
}
