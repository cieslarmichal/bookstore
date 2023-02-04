/* eslint-disable @typescript-eslint/naming-convention */
import { NextFunction, Request, Response } from 'express';

import { HttpHeader } from '../../../common/http/contracts/httpHeader';
import { HttpMediaType } from '../../../common/http/contracts/httpMediaType';

export function jsonMiddleware(_request: Request, response: Response, next: NextFunction): void {
  response.setHeader(HttpHeader.contentType, HttpMediaType.applicationJson);

  next();
}
