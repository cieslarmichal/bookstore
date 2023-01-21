import { BetweenFilter } from './betweenFilter';
import { EqualFilter } from './equalFilter';
import { FilterName } from './filterName';
import { GreaterThanFilter } from './greaterThanFilter';
import { GreaterThanOrEqualFilter } from './greaterThanOrEqualFilter';
import { LessThanFilter } from './lessThanFilter';
import { LessThanOrEqualFilter } from './lessThanOrEqualFilter';
import { LikeFilter } from './likeFilter';

export class FilterFactory {
  public static create(filterName: string, fieldName: string, data: any) {
    switch (filterName) {
      case FilterName.equal:
        return new EqualFilter(fieldName, data);
      case FilterName.lessThan:
        return new LessThanFilter(fieldName, data);
      case FilterName.lessThanOrEqual:
        return new LessThanOrEqualFilter(fieldName, data);
      case FilterName.greaterThan:
        return new GreaterThanFilter(fieldName, data);
      case FilterName.greaterThanOrEqual:
        return new GreaterThanOrEqualFilter(fieldName, data);
      case FilterName.between:
        return new BetweenFilter(fieldName, data);
      case FilterName.like:
        return new LikeFilter(fieldName, data);
    }

    throw new Error('Filter not defined');
  }
}
