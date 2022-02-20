export class BadRequestError extends Error {
  public constructor(message: string) {
    super(message);

    this.name = 'BadRequestError';
  }
}
