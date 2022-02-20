export class NotFoundError extends Error {
  public constructor() {
    super('Object not found');

    this.name = 'NotFoundError';
  }
}
