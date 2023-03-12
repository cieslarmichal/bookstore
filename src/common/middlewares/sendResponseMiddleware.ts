/* eslint-disable @typescript-eslint/naming-convention */
import { NextFunction, Request, Response } from 'express';

import { ControllerResponse } from '../types/controllerResponse';
import { LocalsName } from '../types/localsName';

export function sendResponseMiddleware(_request: Request, response: Response, next: NextFunction): void {
  const controllerResponse: ControllerResponse = response.locals[LocalsName.controllerResponse];

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
