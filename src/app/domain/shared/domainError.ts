export class DomainError<Context> extends Error {
  public constructor(message: string, public readonly context: Context) {
    super(message);
  }
}
