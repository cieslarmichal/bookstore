import { FilterSymbol } from '../../../../../common/filter/filterSymbol';

export const findBooksFilters: Map<string, Array<string>> = new Map(
  Object.entries({
    title: [FilterSymbol.equal, FilterSymbol.like],
    releaseYear: [
      FilterSymbol.equal,
      FilterSymbol.lessThan,
      FilterSymbol.lessThanOrEqual,
      FilterSymbol.greaterThan,
      FilterSymbol.greaterThanOrEqual,
      FilterSymbol.between,
    ],
    language: [FilterSymbol.equal],
    format: [FilterSymbol.equal],
    price: [
      FilterSymbol.equal,
      FilterSymbol.lessThan,
      FilterSymbol.lessThanOrEqual,
      FilterSymbol.greaterThan,
      FilterSymbol.greaterThanOrEqual,
      FilterSymbol.between,
    ],
  }),
);
