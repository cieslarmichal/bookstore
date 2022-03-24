import {
  BetweenOperation,
  EqualOperation,
  GreaterThanOperation,
  GreaterThanOrEqualOperation,
  LessThanOperation,
  LessThanOrEqualOperation,
  LikeOperation,
} from './operations';

export type Filter =
  | EqualOperation
  | LessThanOperation
  | LessThanOrEqualOperation
  | GreaterThanOperation
  | GreaterThanOrEqualOperation
  | BetweenOperation
  | LikeOperation;
