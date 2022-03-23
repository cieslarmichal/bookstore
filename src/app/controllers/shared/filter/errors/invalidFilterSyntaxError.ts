export class InvalidFilterSyntaxError extends Error {
  public constructor() {
    super('Error while parsing filter object');
  }
}
