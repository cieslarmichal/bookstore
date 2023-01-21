import { FilterName } from '../../../../../common/filter/filterName';

export const findBooksFilters: Map<string, Array<string>> = new Map(
  Object.entries({
    title: [FilterName.equal, FilterName.like],
    releaseYear: [
      FilterName.equal,
      FilterName.lessThan,
      FilterName.lessThanOrEqual,
      FilterName.greaterThan,
      FilterName.greaterThanOrEqual,
      FilterName.between,
    ],
    language: [FilterName.equal],
    format: [FilterName.equal],
    price: [
      FilterName.equal,
      FilterName.lessThan,
      FilterName.lessThanOrEqual,
      FilterName.greaterThan,
      FilterName.greaterThanOrEqual,
      FilterName.between,
    ],
  }),
);
