import { FilterName } from '../../../../../common/filter/filterName';

export const findAuthorsFilters: Map<string, Array<string>> = new Map(
  Object.entries({
    firstName: [FilterName.equal, FilterName.like],
    lastName: [FilterName.equal, FilterName.like],
  }),
);
