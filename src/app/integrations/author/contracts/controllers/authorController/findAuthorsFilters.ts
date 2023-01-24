import { FilterSymbol } from '../../../../../common/filter/filterSymbol';

export const findAuthorsFilters: Map<string, Array<string>> = new Map(
  Object.entries({
    firstName: [FilterSymbol.equal, FilterSymbol.like],
    lastName: [FilterSymbol.equal, FilterSymbol.like],
  }),
);
