export class ValidationError extends Error {
  public constructor() {
    super(`Error while validating object properties)}.`);

    this.name = 'ValidationError';
  }
}
