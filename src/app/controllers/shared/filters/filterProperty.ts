class GreaterThanFilter<T> {
  public readonly gt: T;
}

class GreaterThanOrEqualFilter<T> {
  public readonly gte: T;
}

class LessThanFilter<T> {
  public readonly lt: T;
}

class LessThanOrEqualFilter<T> {
  public readonly lte: T;
}

class LikeFilter<T> {
  public readonly like: T;
}

export type FilterProperty<T> =
  | GreaterThanFilter<T>
  | GreaterThanOrEqualFilter<T>
  | LessThanFilter<T>
  | LessThanOrEqualFilter<T>
  | LikeFilter<T>;
