import { NextFunction, Request, Response } from 'express';

export function sendResponseMiddleware(request: Request, response: Response, next: NextFunction) {
  console.log(response.locals.controllerResponse);
  const controllerResponse = response.locals.controllerResponse;

  if (!controllerResponse) {
    next();
  }

  if (controllerResponse.statusCode) {
    response.status(controllerResponse.statusCode);
  }

  if (controllerResponse.data) {
    response.send({ data: controllerResponse.data });
  } else {
    response.send();
  }
}
