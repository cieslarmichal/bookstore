import { FilterSymbol } from '../../../../../common/types/filterSymbol';

export const findCategoriesFilters: Record<string, FilterSymbol[]> = {
  name: [FilterSymbol.equal, FilterSymbol.like],
};
