export interface Mapper<Input, Output> {
  map(input: Input): Output;
}
