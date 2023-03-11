import { FilterSymbol } from '../../../../common/types/contracts/filterSymbol';

export const findAuthorsFilters: Record<string, FilterSymbol[]> = {
  firstName: [FilterSymbol.equal, FilterSymbol.like],
  lastName: [FilterSymbol.equal, FilterSymbol.like],
};
