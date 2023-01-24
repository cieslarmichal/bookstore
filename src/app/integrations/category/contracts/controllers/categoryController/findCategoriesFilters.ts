import { FilterSymbol } from '../../../../../common/filter/filterName';

export const findCategoriesFilters: Map<string, Array<string>> = new Map(
  Object.entries({
    name: [FilterSymbol.equal, FilterSymbol.like],
  }),
);
