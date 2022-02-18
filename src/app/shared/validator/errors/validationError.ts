export class ValidationError extends Error {
  public constructor() {
    super('Error while validating object');

    this.name = 'ValidationError';
  }
}
