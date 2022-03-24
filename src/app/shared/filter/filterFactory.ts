import { BetweenFilter } from './betweenFilter';
import { EqualFilter } from './equalFilter';
import { GreaterThanFilter } from './greaterThanFilter';
import { GreaterThanOrEqualFilter } from './greaterThanOrEqualFilter';
import { LessThanFilter } from './lessThanFilter';
import { LessThanOrEqualFilter } from './lessThanOrEqualFilter';
import { LikeFilter } from './likeFilter';
import {
  BETWEEN_FILTER_NAME,
  EQUAL_FILTER_NAME,
  GREATER_THAN_FILTER_NAME,
  GREATER_THAN_OR_EQUAL_FILTER_NAME,
  LESS_THAN_FILTER_NAME,
  LESS_THAN_OR_EQUAL_FILTER_NAME,
  LIKE_FILTER_NAME,
} from './filterNames';

export class FilterFactory {
  public static create(filterName: string, fieldName: string, data: any) {
    switch (filterName) {
      case EQUAL_FILTER_NAME:
        return new EqualFilter(fieldName, data);
      case LESS_THAN_FILTER_NAME:
        return new LessThanFilter(fieldName, data);
      case LESS_THAN_OR_EQUAL_FILTER_NAME:
        return new LessThanOrEqualFilter(fieldName, data);
      case GREATER_THAN_FILTER_NAME:
        return new GreaterThanFilter(fieldName, data);
      case GREATER_THAN_OR_EQUAL_FILTER_NAME:
        return new GreaterThanOrEqualFilter(fieldName, data);
      case BETWEEN_FILTER_NAME:
        return new BetweenFilter(fieldName, data);
      case LIKE_FILTER_NAME:
        return new LikeFilter(fieldName, data);
    }

    throw new Error('Filter not defined');
  }
}
