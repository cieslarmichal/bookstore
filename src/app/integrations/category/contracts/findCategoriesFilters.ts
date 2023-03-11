import { FilterSymbol } from '../../../../common/types/contracts/filterSymbol';

export const findCategoriesFilters: Record<string, FilterSymbol[]> = {
  name: [FilterSymbol.equal, FilterSymbol.like],
};
