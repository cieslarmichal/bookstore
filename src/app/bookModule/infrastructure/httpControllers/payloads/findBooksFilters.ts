import { FilterSymbol } from '../../../../common/types/contracts/filterSymbol';

export const findBooksFilters: Record<string, FilterSymbol[]> = {
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
};
