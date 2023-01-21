export class InvalidFilterSyntaxError extends Error {
  public constructor(errorDetails: string) {
    super(`Error while parsing filter object: ${errorDetails}`);
  }
}
