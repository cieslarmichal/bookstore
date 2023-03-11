import { HttpRoute } from './httpRoute';

export abstract class HttpController {
  public abstract readonly basePath: string;

  public abstract getHttpRoutes(): HttpRoute[];
}
