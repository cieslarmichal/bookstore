import { BetweenFilter } from './betweenFilter';
import { EqualFilter } from './equalFilter';
import { GreaterThanFilter } from './greaterThanFilter';
import { GreaterThanOrEqualFilter } from './greaterThanOrEqualFilter';
import { LessThanFilter } from './lessThanFilter';
import { LessThanOrEqualFilter } from './lessThanOrEqualFilter';
import { LikeFilter } from './likeFilter';

export type Filter =
  | BetweenFilter
  | EqualFilter
  | GreaterThanFilter
  | GreaterThanOrEqualFilter
  | LessThanFilter
  | LessThanOrEqualFilter
  | LikeFilter;
