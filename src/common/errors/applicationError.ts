import { BaseError } from './baseError';

export class ApplicationError<Context> extends BaseError<Context> {
  public constructor(name: string, message: string, context: Context) {
    super(name, message, context);
  }
}
