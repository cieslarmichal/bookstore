import { FilterName } from './filterName';
import { FilterSymbol } from './filterSymbol';

export interface BetweenFilter {
  readonly filterName: FilterName.between;
  readonly filterSymbol: FilterSymbol.between;
  readonly fieldName: string;
  readonly from: number;
  readonly to: number;
}

export interface EqualFilter {
  readonly filterName: FilterName.equal;
  readonly filterSymbol: FilterSymbol.equal;
  readonly fieldName: string;
  readonly values: string[];
}

export interface GreaterThanFilter {
  readonly filterName: FilterName.greaterThan;
  readonly filterSymbol: FilterSymbol.greaterThan;
  readonly fieldName: string;
  readonly value: number;
}

export interface GreaterThanOrEqualFilter {
  readonly filterName: FilterName.greaterThanOrEqual;
  readonly filterSymbol: FilterSymbol.greaterThanOrEqual;
  readonly fieldName: string;
  readonly value: number;
}

export interface LessThanFilter {
  readonly filterName: FilterName.lessThan;
  readonly filterSymbol: FilterSymbol.lessThan;
  readonly fieldName: string;
  readonly value: number;
}

export interface LessThanOrEqualFilter {
  readonly filterName: FilterName.lessThanOrEqual;
  readonly filterSymbol: FilterSymbol.lessThanOrEqual;
  readonly fieldName: string;
  readonly value: number;
}

export interface LikeFilter {
  readonly filterName: FilterName.like;
  readonly filterSymbol: FilterSymbol.like;
  readonly fieldName: string;
  readonly value: string;
}

export type Filter =
  | BetweenFilter
  | EqualFilter
  | GreaterThanFilter
  | GreaterThanOrEqualFilter
  | LessThanFilter
  | LessThanOrEqualFilter
  | LikeFilter;
