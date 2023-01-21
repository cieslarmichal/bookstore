import { FilterName } from '../../../../../common/filter/filterName';

export const findCategoriesFilters: Map<string, Array<string>> = new Map(
  Object.entries({
    name: [FilterName.equal, FilterName.like],
  }),
);
