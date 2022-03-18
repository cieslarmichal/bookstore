export interface FilterProperty<T> {
  readonly gt?: T;
  readonly gte?: T;
  readonly lt?: T;
  readonly lte?: T;
  readonly like?: T;
}
